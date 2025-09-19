const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    
    // Fetch user details based on role
    let user;
    if (decoded.role === 'system_admin') {
      user = await prisma.systemAdmin.findUnique({
        where: { id: decoded.id }
      });
    } else if (decoded.role === 'user') {
      user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireSystemAdmin = requireRole(['system_admin']);
const requireUser = requireRole(['user']);
const requireAnyRole = requireRole(['system_admin', 'user']);

module.exports = {
  authenticateToken,
  requireRole,
  requireSystemAdmin,
  requireUser,
  requireAnyRole,
};
