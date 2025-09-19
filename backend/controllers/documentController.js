const prisma = require('../config/database');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const createDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, folderId } = req.body;

    // Check if folder exists and user has access
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { category: true },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if user has access to the folder's category
    if (req.user.role === 'user') {
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: folder.categoryId,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this folder' });
      }
    }

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'auto',
      folder: `documents/${folder.category.name}/${folder.name}`,
      use_filename: true,
      unique_filename: true,
    });

    const documentData = {
      title,
      description,
      cloudinaryUrl: uploadResult.secure_url,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      folderId,
      ownerType: req.user.role,
    };

    if (req.user.role === 'system_admin') {
      documentData.uploadedByAdminId = req.user.id;
    } else {
      documentData.uploadedByUserId = req.user.id;
    }

    const document = await prisma.document.create({
      data: documentData,
      include: {
        folder: {
          select: { name: true, category: { select: { name: true } } },
        },
        uploadedByAdmin: {
          select: { name: true, email: true },
        },
        uploadedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    // Create initial version
    const versionData = {
      documentId: document.id,
      versionNumber: 1,
      cloudinaryUrl: uploadResult.secure_url,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      changeLog: 'Initial version',
    };

    if (req.user.role === 'system_admin') {
      versionData.uploadedByAdminId = req.user.id;
    } else {
      versionData.uploadedByUserId = req.user.id;
    }

    await prisma.documentVersion.create({
      data: versionData,
    });

    res.status(201).json({
      message: 'Document created successfully',
      document,
    });
  } catch (error) {
    console.error('Document creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDocumentsByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    // Check if folder exists and user has access
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: { categoryId: true },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if user has access to the folder's category
    if (req.user.role === 'user') {
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: folder.categoryId,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this folder' });
      }
    }

    const documents = await prisma.document.findMany({
      where: { folderId },
      include: {
        folder: {
          select: { name: true },
        },
        uploadedByAdmin: {
          select: { name: true, email: true },
        },
        uploadedByUser: {
          select: { name: true, email: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        folder: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
        uploadedByAdmin: {
          select: { name: true, email: true },
        },
        uploadedByUser: {
          select: { name: true, email: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            uploadedByAdmin: {
              select: { name: true, email: true },
            },
            uploadedByUser: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has access to the document's category
    if (req.user.role === 'user') {
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: document.folder.category.id,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this document' });
      }
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        folder: {
          select: { categoryId: true },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions
    if (req.user.role === 'user') {
      // Users can only update their own documents
      if (document.uploadedByUserId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Check if user still has access to the category
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: document.folder.categoryId,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this document' });
      }
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title,
        description,
      },
      include: {
        folder: {
          select: { name: true },
        },
        uploadedByAdmin: {
          select: { name: true, email: true },
        },
        uploadedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    res.json({
      message: 'Document updated successfully',
      document: updatedDocument,
    });
  } catch (error) {
    console.error('Document update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createDocumentVersion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { id } = req.params;
    const { changeLog } = req.body;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        folder: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions
    if (req.user.role === 'user') {
      // Users can only create versions for their own documents
      if (document.uploadedByUserId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Check if user still has access to the category
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: document.folder.category.id,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this document' });
      }
    }

    // Upload new version to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'auto',
      folder: `documents/${document.folder.category.name}/${document.folder.name}`,
      use_filename: true,
      unique_filename: true,
    });

    // Get next version number
    const nextVersionNumber = document.versions.length > 0 ? document.versions[0].versionNumber + 1 : 1;

    const versionData = {
      documentId: document.id,
      versionNumber: nextVersionNumber,
      cloudinaryUrl: uploadResult.secure_url,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      changeLog: changeLog || `Version ${nextVersionNumber}`,
    };

    if (req.user.role === 'system_admin') {
      versionData.uploadedByAdminId = req.user.id;
    } else {
      versionData.uploadedByUserId = req.user.id;
    }

    const version = await prisma.documentVersion.create({
      data: versionData,
      include: {
        uploadedByAdmin: {
          select: { name: true, email: true },
        },
        uploadedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    // Update document's current URL to the latest version
    await prisma.document.update({
      where: { id },
      data: {
        cloudinaryUrl: uploadResult.secure_url,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });

    res.status(201).json({
      message: 'Document version created successfully',
      version,
    });
  } catch (error) {
    console.error('Document version creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDocumentVersions = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        folder: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has access to the document's category
    if (req.user.role === 'user') {
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: document.folder.category.id,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this document' });
      }
    }

    const versions = await prisma.documentVersion.findMany({
      where: { documentId: id },
      orderBy: { versionNumber: 'desc' },
      include: {
        uploadedByAdmin: {
          select: { name: true, email: true },
        },
        uploadedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    res.json({ versions });
  } catch (error) {
    console.error('Get document versions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        folder: {
          select: { categoryId: true },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions
    if (req.user.role === 'user') {
      // Users can only delete their own documents
      if (document.uploadedByUserId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Check if user still has access to the category
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: document.folder.categoryId,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this document' });
      }
    }

    // Delete from Cloudinary (optional - you might want to keep files for backup)
    // await cloudinary.uploader.destroy(document.cloudinaryPublicId);

    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const restoreDocumentVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        folder: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions
    if (req.user.role === 'user') {
      if (document.uploadedByUserId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: document.folder.category.id,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this document' });
      }
    }

    // Get the version to restore
    const versionToRestore = await prisma.documentVersion.findUnique({
      where: { id: versionId },
    });

    if (!versionToRestore || versionToRestore.documentId !== id) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Get next version number
    const nextVersionNumber = document.versions.length > 0 ? document.versions[0].versionNumber + 1 : 1;

    // Create new version from current document
    const newVersionData = {
      documentId: document.id,
      versionNumber: nextVersionNumber,
      cloudinaryUrl: versionToRestore.cloudinaryUrl,
      fileType: versionToRestore.fileType,
      fileSize: versionToRestore.fileSize,
      changeLog: `Restored from version ${versionToRestore.versionNumber}`,
    };

    if (req.user.role === 'system_admin') {
      newVersionData.uploadedByAdminId = req.user.id;
    } else {
      newVersionData.uploadedByUserId = req.user.id;
    }

    const newVersion = await prisma.documentVersion.create({
      data: newVersionData,
      include: {
        uploadedByAdmin: {
          select: { name: true, email: true },
        },
        uploadedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    // Update document's current URL to the restored version
    await prisma.document.update({
      where: { id },
      data: {
        cloudinaryUrl: versionToRestore.cloudinaryUrl,
        fileType: versionToRestore.fileType,
        fileSize: versionToRestore.fileSize,
      },
    });

    res.json({
      message: 'Document version restored successfully',
      version: newVersion,
    });
  } catch (error) {
    console.error('Document version restore error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createDocument,
  getDocumentsByFolder,
  getDocumentById,
  updateDocument,
  createDocumentVersion,
  getDocumentVersions,
  restoreDocumentVersion,
  deleteDocument,
};
