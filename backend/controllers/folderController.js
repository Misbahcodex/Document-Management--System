const prisma = require('../config/database');

const createFolder = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    
    // Check if user has access to the category
    if (req.user.role === 'user') {
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this category' });
      }
    }

    const folderData = {
      name,
      description,
      categoryId,
      ownerType: req.user.role,
    };

    if (req.user.role === 'system_admin') {
      folderData.createdByAdminId = req.user.id;
    } else {
      folderData.createdByUserId = req.user.id;
    }

    const folder = await prisma.folder.create({
      data: folderData,
      include: {
        category: {
          select: { name: true },
        },
        createdByAdmin: {
          select: { name: true, email: true },
        },
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Folder created successfully',
      folder,
    });
  } catch (error) {
    console.error('Folder creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFoldersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if user has access to the category
    if (req.user.role === 'user') {
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this category' });
      }
    }

    const folders = await prisma.folder.findMany({
      where: { categoryId },
      include: {
        category: {
          select: { name: true },
        },
        createdByAdmin: {
          select: { name: true, email: true },
        },
        createdByUser: {
          select: { name: true, email: true },
        },
        documents: {
          select: { id: true, title: true, fileType: true, createdAt: true },
        },
      },
    });

    res.json({ folders });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
        createdByAdmin: {
          select: { name: true, email: true },
        },
        createdByUser: {
          select: { name: true, email: true },
        },
        documents: {
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
          },
        },
      },
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

    res.json({ folder });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const folder = await prisma.folder.findUnique({
      where: { id },
      select: { categoryId: true, ownerType: true, createdByAdminId: true, createdByUserId: true },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check permissions
    if (req.user.role === 'user') {
      // Users can only update their own folders
      if (folder.createdByUserId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Check if user still has access to the category
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: folder.categoryId,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this category' });
      }
    }

    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        category: {
          select: { name: true },
        },
        createdByAdmin: {
          select: { name: true, email: true },
        },
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    });

    res.json({
      message: 'Folder updated successfully',
      folder: updatedFolder,
    });
  } catch (error) {
    console.error('Folder update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { id },
      select: { 
        categoryId: true, 
        ownerType: true, 
        createdByAdminId: true, 
        createdByUserId: true,
        documents: true,
      },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if folder has documents
    if (folder.documents.length > 0) {
      return res.status(400).json({ error: 'Cannot delete folder that contains documents' });
    }

    // Check permissions
    if (req.user.role === 'user') {
      // Users can only delete their own folders
      if (folder.createdByUserId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Check if user still has access to the category
      const hasAccess = await prisma.accessControl.findFirst({
        where: {
          categoryId: folder.categoryId,
          userId: req.user.id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this category' });
      }
    }

    await prisma.folder.delete({
      where: { id },
    });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Folder deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createFolder,
  getFoldersByCategory,
  getFolderById,
  updateFolder,
  deleteFolder,
};
