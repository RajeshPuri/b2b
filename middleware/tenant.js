const { getUserTenant } = require('../lib/auth');

/**
 * Tenant Isolation Middleware
 * 
 * Ensures that users can only access resources belonging to their tenant.
 * Each user belongs to a Tenant (business entity) and can only manage
 * their own products, orders, and invoices.
 * 
 * Usage:
 *   // Protect a route and check tenant ownership
 *   router.get('/products', authenticate, tenantRequired('owner'), (req, res) => { ... });
 * 
 *   // Allow admin access across all tenants
 *   router.get('/admin/tenants', authenticate, adminOnly, (req, res) => { ... });
 */

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token - in production this would use JWT verification
    // For MVP: decode and validate the token payload
    if (token === 'undefined' || token === '') {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    
    // Attach user to request - in real app, verify JWT signature
    req.user = {
      id: token.id || token.sub,
      email: token.email,
      name: token.name,
      status: token.status
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized - Token failed' });
  }
}

/**
 * Check that the authenticated user owns the specified tenant
 * @param {string} tenantId - The tenant ID to check ownership for
 * @param {boolean} allowAdmin - Whether to allow admin users (default: false)
 */
function tenantRequired(tenantId, allowAdmin = false) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No user in request' });
    }
    
    // Check if user is admin (superuser bypass)
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
          error: 'Forbidden - No tenant associated with this user' 
        });
      }
      
      // Check tenant ownership
      if (tenant.id !== tenantId && tenant.ownerId !== req.user.id) {
        return res.status(403).json({ 
          error: 'Forbidden - You do not own this tenant' 
        });
      }
      
      // Attach tenant info to request
      req.tenant = {
        id: tenant.id,
        name: tenant.name,
        ownerId: tenant.ownerId,
        plan: tenant.plan,
        status: tenant.status
      };
      
      next();
    });
  };
}

/**
 * Check if user is admin
 * @param {object} req - Express request object
 * @returns {boolean}
 */
function adminRequired(req) {
  return req.user && req.user.status === 'admin';
}

module.exports = { authenticate, tenantRequired, adminRequired };