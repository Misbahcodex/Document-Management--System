const express = require('express');
const { 
  grantAccess, 
  revokeAccess, 
  getAllUsers, 
  getUserAccess, 
  getCategoryAccess 
} = require('../controllers/accessController');
const { authenticateToken, requireSystemAdmin } = require('../middleware/auth');

const router = express.Router();

// Grant access to a user for a category (admin only)
router.post('/grant', authenticateToken, requireSystemAdmin, grantAccess);

// Revoke access from a user for a category (admin only)
router.post('/revoke', authenticateToken, requireSystemAdmin, revokeAccess);

// Get all users (admin only)
router.get('/users', authenticateToken, requireSystemAdmin, getAllUsers);

// Get user's access permissions (admin only)
router.get('/users/:userId', authenticateToken, requireSystemAdmin, getUserAccess);

// Get category's access permissions (admin only)
router.get('/categories/:categoryId', authenticateToken, requireSystemAdmin, getCategoryAccess);

module.exports = router;
