const express = require('express');
const { 
  createFolder, 
  getFoldersByCategory, 
  getFolderById, 
  updateFolder, 
  deleteFolder 
} = require('../controllers/folderController');
const { authenticateToken, requireAnyRole } = require('../middleware/auth');

const router = express.Router();

// Create folder
router.post('/', authenticateToken, requireAnyRole, createFolder);

// Get folders by category
router.get('/category/:categoryId', authenticateToken, requireAnyRole, getFoldersByCategory);

// Get folder by ID
router.get('/:id', authenticateToken, requireAnyRole, getFolderById);

// Update folder
router.put('/:id', authenticateToken, requireAnyRole, updateFolder);

// Delete folder
router.delete('/:id', authenticateToken, requireAnyRole, deleteFolder);

module.exports = router;
