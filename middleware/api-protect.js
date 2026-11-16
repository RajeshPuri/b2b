const { verifyUser, getUserById, getUserTenant, hashPassword } = require('../lib/auth');
const jwt = require('jsonwebtoken');

// ==========================================
// Express Middleware: JWT Authentication
// ==========================================

/**
 * authenticateJWT - Verify JWT token and attach user to request
 * 
 * Expected: Authorization: Bearer <jwt-token>
 * Token payload should contain: { id, email, name, status }
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided. Use: Authorization: Bearer <token>'
    });
  }
  
  const token = authHeader.substring(7);
  
  if (!token || token === 'undefined') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token format'
    });
  }
  
  try {
    // Verify JWT signature
    const secret = process.env.SESSION_SECRET || 'dev-session-secret-change-me';
    const payload = jwt.verify(token, secret);
    
    // Attach user to request
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      status: payload.status
    };
    
    // Fetch full user record from database for tenant info
    getUserById(payload.id, (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (user) {
        req.tenantId = user.tenantId;
      }
    });
    
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Failed to verify token'
    });
  }
}

// ==========================================
// Express Middleware: Tenant Isolation
// ==========================================

/**
 * tenantRequired - Ensure user belongs to the required tenant
 * @param {string|Function} requiredTenant - Tenant ID or function to determine required tenant
 * @param {boolean} allowAdmin - Allow admin users to bypass (default: false)
 */
function tenantRequired(requiredTenant, allowAdmin = false) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authenticated user'
      });
    }
    
    // Allow admin bypass
    if (allowAdmin && req.user.status === 'admin') {
      return next();
    }
    
    // Get user's tenant
    getUserTenant(req.user.id, (err, tenant) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!tenant) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'No tenant associated with this user'
        });
      }
      
      // Check tenant ownership
      const userTenantId = tenant.id;
      
      if (typeof requiredTenant === 'function') {
        requiredTenant(req, tenant, next);
      } else if (userTenantId !== requiredTenant) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `You do not have access to tenant ${requiredTenant}. Your tenant: ${userTenantId}`
        });
      } else {
        req.tenant = tenant;
        next();
      }
    });
  };
}

// ==========================================
// Express Middleware: Role-Based Access
// ==========================================

/**
 * roleRequired - Check user role permission
 * @param {string|Array} allowedRoles - Single role or array of allowed roles
 */
function roleRequired(allowedRoles) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authenticated user'
      });
    }
    
    const userRole = req.user.role;
    const allowed = Array.isArray(allowedRoles) 
      ? allowedRoles.includes(userRole) 
      : allowedRoles === userRole;
    
    if (!allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role "${userRole}" not authorized for this resource. Allowed: ${Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}`
      });
    }
    
    next();
  };
}

// ==========================================
// Helper: Generate Auth Token
// ==========================================

/**
 * generateAuthToken - Create a JWT token for a user
 * @param {object} user - User object from database
 * @returns {string} - Signed JWT token
 */
function generateAuthToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status
  };
  
  const secret = process.env.SESSION_SECRET || 'dev-session-secret-change-me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(payload, secret, { expiresIn });
}

// ==========================================
// Export All Middleware
// ==========================================

module.exports = {
  authenticateJWT,
  tenantRequired,
  roleRequired,
  generateAuthToken,
  verifyUser,
  getUserById,
  getUserTenant,
  hashPassword
};