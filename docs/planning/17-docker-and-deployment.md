# 18. Docker and Deployment Architecture

## 18.1 Docker Compose Services

### 18.1.1 Development Environment

```yaml
version: '3.9'

services:
  # Application
  app:
    build:
      context: ./docker/app
      target: development
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=development
      - DATABASE_URL="postgres://b2b_user:${POSTGRES_PASSWORD}@postgres:5432/b2b_platform?schema=public"
      - DIRECT_URL="postgres://b2b_user:${POSTGRES_PASSWORD}@postgres:5432/b2b_platform?schema=public"
      - REDIS_URL="redis://redis:6379"
      - SESSION_SECRET="${SESSION_SECRET}"
      - NEXTAUTH_URL="http://localhost:3000"
      - NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
      - S3_BUCKET="${S3_BUCKET_DEV}"
      - S3_REGION="${S3_REGION}"
      - S3_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID_DEV}"
      - S3_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY_DEV}"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./:/app
      - /app/node_modules
      - /app/.next
    env_file: .env.development
    restart: unless-stopped
    # Development: auto-restart on code changes via file watchers
    command: ["pnpm", "dev"]

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=b2b_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=b2b_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init:/docker-entrypoint-initdb.d
    ports: ["5432:5432"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "b2b_user", "-d", "b2b_platform"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache/Queue
  redis:
    image: redis:7-alpine
    command: ["redis-server", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
    volumes:
      - redis_data:/data
    ports: ["6379:6379"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Database admin (pgAdmin)
  pgadmin:
    dpage/pgadmin4: latest
    environment:
      - PGADMIN_DEFAULT_EMAIL="admin@b2b.com"
      - PGADMIN_DEFAULT_PASSWORD="${PGADMIN_PASSWORD}"
    ports: ["8080:80"]
    restart: unless-stopped
    depends_on:
      - postgres
```

### 18.1.2 Production Environment

```yaml
version: '3.9'

services:
  # Application
  app:
    build:
      context: ./docker/app
      target: production
    ports: ["80:3000"]  # Behind nginx
    environment:
      - NODE_ENV=production
      - DATABASE_URL="postgres://b2b_user:${POSTGRES_PASSWORD}@postgres:5432/b2b_platform?schema=public&sslmode=require"
      - DIRECT_URL="postgres://b2b_user:${POSTGRES_PASSWORD}@postgres:5432/b2b_platform?schema=public"
      - REDIS_URL="redis://redis:6379"
      - SESSION_SECRET="${SESSION_SECRET_PROD}"
      - NEXTAUTH_URL="${NEXTAUTH_URL_PROD}"
      - NEXTAUTH_SECRET="${NEXTAUTH_SECRET_PROD}"
      - S3_BUCKET="${S3_BUCKET_PROD}"
      - S3_REGION="${S3_REGION_PROD}"
      - S3_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID_PROD}"
      - S3_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY_PROD}"
      - RESEND_API_KEY="${RESEND_API_KEY_PROD}"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=b2b_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD_PROD}
      - POSTGRES_DB=b2b_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports: ["5432:5432"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "b2b_user", "-d", "b2b_platform"]
      interval: 10s
      timeout: 5s
      retries: 5

    # Enhanced health check with PostgreSQL 15+
    #consider adding: pg_isready with connection test

  # Cache/Queue
  redis:
    image: redis:7-alpine
    command: ["redis-server", "--maxmemory", "512mb", "--maxmemory-policy", "no-eviction"]
    volumes:
      - redis_data:/data
    ports: ["6379:6379"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Reverse proxy
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/certs:/etc/nginx/certs:ro
      - /dist:/usr/share/nginx/html:ro  # Static files from build
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 18.1.3 Nginx Configuration

```nginx
# /etc/nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app_server {
        server app:3000;
    }

    server {
        listen 80;
        listen 443 ssl;
        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.3 TLSv1.2;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'" always;

        # Root serving
        root /usr/share/nginx/html;
        index index.html;

        # API proxy
        location /api/ {
            proxy_pass http://app_server;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static assets (from Next.js build)
        location /_next/ {
            proxy_pass http://app_server;
            expires 30d;
            add_header Cache-Control "public, max-age=2592000, immutable" always;
        }

        # favicon and manifest
        location = /favicon.ico {
            access_log off;
            log_not_found off;
        }
        location = /robots.txt {
            access_log off;
            log_not_found off;
        }
        location = /sitemap.xml {
            access_log off;
            log_not_found off;
        }

        # Catch-all for Next.js App Router
        location / {
            proxy_pass http://app_server;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 18.2 Environment Configuration

### 18.2.1 Environment Variables by Stage

| Variable | Development | Staging | Production | Description |
|----------|------------|---------|------------|-------------|
| `NODE_ENV` | `development` | `staging` | `production` | Affects build, logging, error handling |
| `DATABASE_URL` | Local PG URL | Staging PG URL | Prod PG URL + sslmode=require | PostgreSQL connection |
| `DIRECT_URL` | Same as DB | Same as DB | Same as DB | Prisma migration connection |
| `REDIS_URL` | `redis://localhost:6379` | `redis://staging-redis:6379` | `redis://prod-redis:6379` | Redis for sessions/cache |
| `SESSION_SECRET` | Generated random | Rotated | Rotated | Auth.js session signing |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://staging.b2b-marketplace.com` | `https://b2b-marketplace.com` | NextAuth callback URL |
| `NEXTAUTH_SECRET` | Generated random | Same format | Same format | NextAuth session secret |
| `S3_BUCKET` | `b2b-dev-uploads` | `b2b-staging-uploads` | `b2b-prod-uploads` | S3 bucket name |
| `S3_REGION` | `us-east-1` | `us-east-1` | `ap-south-1` (or local) | S3 region |
| `S3_ACCESS_KEY_ID` | MinIO/dev keys | Staging keys | Prod keys / cloud IAM | S3 access key |
| `S3_SECRET_ACCESS_KEY` | MinIO/dev secret | Staging secret | Prod secret / cloud secret | S3 secret key |
| `RESEND_API_KEY` | Not set | Test key | Live key | Resend email API |
| `ENCRYPTION_KEY` | Generated | Same format | Same format | For sensitive data encryption |
| `JWT_SECRET` | Generated | Same format | Same format | JWT token signing |
| `POSTGRES_PASSWORD` | Dev password | Staging password | Prod password (secret) | PostgreSQL password |
| `POSTGRES_PRISMA_URL` | Auto-generated | Auto-generated | Auto-generated | Prisma-specific DB URL |
| `RATE_LIMIT_WINDOW_MS` | 60000 (1 min) | 60000 | 60000 | Rate limit window |
| `RATE_LIMIT_MAX` | 100 | 100 | 100 | Max requests per window |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://staging...` | `https://...` | Public-facing app URL |

### 18.2.2 Secret Management

**Never commit `.env` files** to version control.

**.env.example** (committed, no values):
```
DATABASE_URL=
DIRECT_URL=
REDIS_URL=
SESSION_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
RESEND_API_KEY=
ENCRYPTION_KEY=
JWT_SECRET=
POSTGRES_PASSWORD=
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

**CI/CD Secrets** (GitHub Actions):
- Store all sensitive vars as GitHub repository secrets
- Reference via `${{ secrets.VAR_NAME }}` in workflow files
- Rotate regularly (quarterly)

**Docker Secrets** (for production):
- Use Docker Swarm secrets or Kubernetes secrets
- Or mount at runtime from environment
- Never bake secrets into Docker images

## 18.3 CI/CD Pipeline

### 18.3.1 GitHub Actions Workflows

**.github/workflows/deploy.yml**:
```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Prisma generate
        run: npx prisma generate

      - name: Run Prisma migration
        run: npx prisma migrate deploy

      - name: Build Next.js
        run: pnpm build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: nextjs-build
          path: .next/

      - name: Deploy to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          port: 22
          # Upload .next/ directory
          source: ".next/"
          target: "/var/www/b2b/production/"

      - name: Restart PM2 or Docker
        uses: appleboy/ssh-action@v0.1.6
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          port: 22
          command: |
            cd /var/www/b2b/production
            docker compose -f docker-compose.prod.yml up -d
            # Or: pm2 restart all
```

**.github/workflows/test.yml**:
```yaml
name: Test

on:
  pull_request:
    branches: [main]
  push:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm test:unit
      
      - run: pnpm test:integration
      
      - run: pnpm test:e2e --headless
```

### 18.3.2 Pipeline Stages

1. **Lint**: `pnpm lint`, `pnpm typecheck`
2. **Unit Tests**: `pnpm test:unit` (Vitest)
3. **Integration Tests**: `pnpm test:integration` (Playwright)
4. **Build**: `pnpm build`
5. **Migration**: `npx prisma migrate deploy` (if schema changed)
6. **Deploy**: Deploy to target environment

## 18.4 Production Considerations

### 18.4.1 Database Migration Strategy

**Prisma Migrations**:
- Development: `prisma migrate dev` (auto-applies)
- Staging/Production: `prisma migrate deploy` (explicit)
- Production: Take backup before running migrations
- Migration naming: `YYYYMMDD_description` convention
- Rollback: `prisma migrate rollback --target <step>` (test in dev first)

**Zero-Downtime Migrations**:
- Add columns as nullable first
- Backfill data
- Then make columns non-nullable
- Or use `prisma migrate add` with careful planning

### 18.4.2 Backup Strategy

**PostgreSQL Backups**:
- **Daily**: Automated `pg_dump` of entire database
- **Retention**: 30 days automatic, 90 days on request
- **Format**: Compressed custom format (`pg_dump -Fc`)
- **Storage**: Separate bucket/volume from production
- **Test restore**: Monthly restore to staging environment

**Backup Command** (cron job on production host):
```bash
# Daily at 2 AM
pg_dump -h localhost -U b2b_user -d b2b_platform \
  -Fc -b -v -f "/backups/b2b_$(date +%Y%m%d).dump" \
  --no-owner --no-acl \
  --password=${POSTGRES_PASSWORD}
```

**S3 Backup Transfer**:
```bash
aws s3 cp /backups/b2b_$(date +%Y%m%d).dump s3://b2b-backups/db/ --storage-class STANDARD_IA
```

### 18.4.3 Monitoring and Health Checks

**Application Health Endpoint** (`/api/health`):
```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis connectivity
    await redis.ping();
    
    return new Response(
      JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: 'unhealthy', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

**Docker Health Checks** (already defined in compose files):
- App: `curl -f http://localhost:3000/health` (or `/`)
- Postgres: `pg_isready -U b2b_user -d b2b_platform`
- Redis: `redis-cli ping`

**Prometheus Metrics** (Next.js built-in or custom):
- `next_http_requests_total` - HTTP request count
- `next_http_requests_duration_seconds` - Request latency
- Custom: `b2b_active_businesses`, `b2b_orders_total`, etc.

### 18.4.4 Scaling Considerations

**Horizontal Scaling**:
- Next.js app servers: Stateless, can scale behind load balancer
- PostgreSQL: Single instance initially, read replicas later
- Redis: Can cluster for larger scale
- S3: Inherently scalable

**Connection Pooling**:
- PgBouncer between app and PostgreSQL
- Prisma connection pooling enabled
- Maximum connections: 20-50 (depending on workload)
- Session pooling for Redis

**Read Replicas** (future):
- PostgreSQL read replicas for analytics queries
- Separate connection string for read-only queries
- Used for reports/dashboard data that doesn't need real-time consistency

### 18.5 Development Workflow

### 18.5.1 Local Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd B2B

# 2. Copy environment example
cp .env.example .env.local
# Edit .env.local with local values

# 3. Start infrastructure
docker compose up -d postgres redis

# 4. Wait for databases to be ready
# (check health or just wait a few seconds)

# 5. Run migrations and seed
pnpm prisma migrate dev --init
# Or: pnpm prisma generate followed by pnpm prisma migrate deploy

# 6. Start development server
pnpm dev

# 7. Access application
# http://localhost:3000
```

### 18.5.2 Docker Build Optimization

**Multi-stage Build** (Dockerfile.example):
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN pnpm install --frozen-lockfile --production

# Set user
USER appuser

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### 18.5.3 Docker Image Size

- **Builder stage**: ~500MB (Node 20 Alpine)
- **Production stage**: ~150MB (minimal, non-root)
- **Goal**: Keep under 200MB for fast deployment

### 18.5.4 Rollback Strategy

1. **Docker compose**: `docker compose down` then `docker compose up -d` (previous version)
2. **Kubernetes**: `kubectl rollout undo deployment/app`
3. **Database**: Always backup before migrations, `prisma migrate rollback` if needed
4. **File storage**: S3 versioning enabled, can revert to previous object versions

### 18.5.5 TLS Certificate Management

- **Let's Encrypt** with Certbot for initial HTTPS
- **Renewal**: Auto-renew via cron (certbot renew)
- **Production**: Use cloud provider's managed certificates (AWS ACM, etc.)
- **Renewal automation**: Renew 30 days before expiry
- **Multiple domains**: Single cert with SANs, or separate certs per domain

## 18.6 Infrastructure Diagrams

```mermaid
graph TB
    subgraph Internet["Internet"]
        U["Users / Browsers"]
    end
    
    subgraph Cloud["Cloud Infrastructure"]
        NG["Nginx (Public, HTTPS)"]
    end
    
    subgraph VPC["Private VPC"]
        AW ["App Container (Next.js)"]
        PG ["PostgreSQL (private net)"]
        RD ["Redis (private net)"]
    end
    
    U -->|HTTPS| NG
    NG -->|HTTP, internal| AW
    AW -->|SQL protocol| PG
    AW -->|Redis protocol| RD
    NG -->|API calls| AW
    
    style VPC fill:#f0fdf4,stroke:#333,stroke-width:2px
    style PG fill:#f5f5f5,stroke:#333,stroke-width:2px
    style RD fill:#f5f5f5,stroke:#333,stroke-width:2px
```

## 18.7 Environment-Specific Checklist

### Development
- [ ] `.env.local` configured with local values
- [ ] Docker containers running (postgres, redis, app)
- [ ] Prisma migrations applied
- [ ] Development server running at `localhost:3000`
- [ ] Email setup: either Resend test mode or local SMTP
- [ ] S3-compatible storage (MinIO) or local uploads directory
- [ ] Debug mode enabled (error details visible)

### Staging
- [ ] Separate PostgreSQL database (not production)
- [ ] Separate Redis instance
- [ ] Separate S3 bucket (staging prefix)
- [ ] Custom domain or staging domain configured
- [ ] HTTPS (self-signed or Let's Encrypt staging)
- [ ] Environment variables from CI/CD secrets
- [ ] Integration tests passing against staging
- [ ] Manual smoke test completed
- [ ] Onboarding flow tested end-to-end

### Production
- [ ] All environment secrets configured via CI/CD
- [ ] HTTPS/TLS configured and valid
- [ ] Domain name pointed to production infrastructure
- [ ] Nginx reverse proxy configured
- [ ] SSL certificates installed/renewal automated
- [ ] Database backup system configured and tested
- [ ] Health checks passing
- [ ] Monitoring/alerting configured
- [ ] CI/CD pipeline deployed and tested
- [ ] Disaster recovery documentation accessible
- [ ] All feature flags in "off" position for MVP
- [ ] Login/onboarding flow tested with real data
- [ ] Payment flow (if gateway configured) tested in test mode
- [ ] Role-based access verified for all roles
- [ ] Cross-business isolation verified via tests