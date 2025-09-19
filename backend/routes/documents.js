const express = require('express');
const { 
  createDocument, 
  getDocumentsByFolder, 
  getDocumentById, 
  updateDocument, 
  createDocumentVersion, 
  getDocumentVersions, 
  restoreDocumentVersion,
  deleteDocument 
} = require('../controllers/documentController');
const { authenticateToken, requireAnyRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create document with file upload
router.post('/', authenticateToken, requireAnyRole, upload.single('file'), createDocument);

// Get documents by folder
router.get('/folder/:folderId', authenticateToken, requireAnyRole, getDocumentsByFolder);

// Get document by ID
router.get('/:id', authenticateToken, requireAnyRole, getDocumentById);

// Update document metadata
router.put('/:id', authenticateToken, requireAnyRole, updateDocument);

// Create new document version
router.post('/:id/versions', authenticateToken, requireAnyRole, upload.single('file'), createDocumentVersion);

// Get document versions
router.get('/:id/versions', authenticateToken, requireAnyRole, getDocumentVersions);

// Restore document version
router.post('/:id/versions/:versionId/restore', authenticateToken, requireAnyRole, restoreDocumentVersion);

// Delete document
router.delete('/:id', authenticateToken, requireAnyRole, deleteDocument);

module.exports = router;
