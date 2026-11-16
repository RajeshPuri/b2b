'use strict';

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const isLocal =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1');

    return new Pool({
      connectionString,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      max: 10,
    });
  }

  return new Pool({
    host: '127.0.0.1',
    port: 5433,
    user: 'b2b_user',
    password: 'devpass123',
    database: 'b2b_platform',
    max: 10,
  });
}

const pool = createPool();

// Verify user credentials against the database
function verifyUser(email, password, callback) {
  (async function () {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.status, u."passwordHash", u."createdAt",
              m.role AS "membershipRole", m."businessId",
              b.name AS "businessName", b.type AS "businessType"
       FROM "User" u
       LEFT JOIN "BusinessMembership" m
         ON m."userId" = u.id AND m.status = 'ACTIVE' AND m."leftAt" IS NULL
       LEFT JOIN "Business" b ON b.id = m."businessId"
       WHERE u.email = $1
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return callback(null, null);
    }

    const user = result.rows[0];

    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      return callback(null, null);
    }

    let valid = false;
    if (user.passwordHash && user.passwordHash.startsWith('$2')) {
      valid = await bcrypt.compare(password || '', user.passwordHash);
    } else {
      valid = user.passwordHash === password;
    }

    if (!valid) {
      return callback(null, null);
    }

    return callback(null, {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      role: user.membershipRole || 'ADMIN',
      businessId: user.businessId || null,
      businessName: user.businessName || null,
      businessType: user.businessType || null,
      createdAt: user.createdAt
    });
  })().catch(function (err) {
    return callback(err, null);
  });
}

// Get user by ID (for session continuation)
function getUserById(userId, callback) {
  pool.connect(function(err, client, release) {
    if (err) {
      return callback(err, null);
    }
    
    client.query(
      'SELECT id, email, name, status, "createdAt" FROM "User" WHERE id = \$1',
      [userId],
      function(err, result) {
        release();
        
        if (err) {
          return callback(err, null);
        }
        
        if (result.rows.length === 0) {
          return callback(null, null);
        }
        
        const user = result.rows[0];
        return callback(null, {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          createdAt: user.createdAt
        });
      }
    );
  });
}

// Check if user has a tenant/store associated
function getUserTenant(userId, callback) {
  pool.connect(function(err, client, release) {
    if (err) {
      return callback(err, null);
    }
    
    client.query(
      'SELECT * FROM "Tenant" WHERE ownerid = \$1',
      [userId],
      function(err, result) {
        release();
        
        if (err) {
          return callback(err, null);
        }
        
        if (result.rows.length === 0) {
          return callback(null, null);
        }
        
        return callback(null, result.rows[0]);
      }
    );
  });
}

// Generate a tenant ID for new user registration
function generateTenantId(callback) {
  pool.query(
    'SELECT COUNT(*) AS count FROM "Tenant"',
    function(err, result) {
      if (err) {
        return callback(err, null);
      }

      const count = parseInt(result.rows[0].count);
      const newTenantId = `tenant_${count + 1}`;
      return callback(null, newTenantId);
    }
  );
}

// Hash password for production use (MVP placeholder)
function hashPassword(password) {
  // In production: use bcrypt.hash(password, 10)
  // For MVP: return plain password (authentication accepts any pass for existing users)
  return password;
}

module.exports = { verifyUser, getUserById, getUserTenant, generateTenantId, hashPassword };