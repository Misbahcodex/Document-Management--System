const express = require('express');
const { 
  registerSystemAdmin, 
  loginSystemAdmin, 
  registerUser, 
  loginUser,
  getCurrentUser 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// System Admin routes
router.post('/admin/register', registerSystemAdmin);
router.post('/admin/login', loginSystemAdmin);

// User routes
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

// Get current user (protected)
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
