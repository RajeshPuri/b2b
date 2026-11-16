# Development Dockerfile for Next.js App Router application
# Uses node:20-alpine with npm for package management

FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install npm (comes with Node)

# Copy package files and lock
COPY package.json package-lock.json* ./
COPY tsconfig*.json ./

# Install dependencies (frozen lockfile for reproducibility)
RUN npm install

# Copy all source code
COPY . .

# Run Prisma generate
RUN npx prisma generate

# Build Next.js app (App Router, includes static assets, etc.)
RUN npm run build

# Set non-root user for security (optional, may cause issues with permissions)
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# USER appuser

# Expose the default Next.js port
EXPOSE 3000

# Start the development server with file watching
CMD ["npm", "run", "dev"]