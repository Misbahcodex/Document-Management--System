const express = require('express');
const { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { authenticateToken, requireSystemAdmin, requireAnyRole } = require('../middleware/auth');

const router = express.Router();

// Get all categories (both admin and user can access)
router.get('/', authenticateToken, requireAnyRole, getAllCategories);

// Get category by ID (both admin and user can access if they have permission)
router.get('/:id', authenticateToken, requireAnyRole, getCategoryById);

// Create category (admin only)
router.post('/', authenticateToken, requireSystemAdmin, createCategory);

// Update category (admin only)
router.put('/:id', authenticateToken, requireSystemAdmin, updateCategory);

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireSystemAdmin, deleteCategory);

module.exports = router;
