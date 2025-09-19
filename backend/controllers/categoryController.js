const prisma = require('../config/database');

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await prisma.category.create({
      data: {
        name,
        description,
        createdByAdminId: req.user.id,
      },
    });

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllCategories = async (req, res) => {
  try {
    let categories;
    
    if (req.user.role === 'system_admin') {
      // System admin can see all categories
      categories = await prisma.category.findMany({
        include: {
          createdByAdmin: {
            select: { name: true, email: true },
          },
          folders: true,
          accessControls: {
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
      });
    } else {
      // Users can only see categories they have access to
      categories = await prisma.category.findMany({
        where: {
          accessControls: {
            some: {
              userId: req.user.id,
            },
          },
        },
        include: {
          createdByAdmin: {
            select: { name: true, email: true },
          },
          folders: true,
          accessControls: {
            where: {
              userId: req.user.id,
            },
          },
        },
      });
    }

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereClause = { id };
    
    // If user is not system admin, check access control
    if (req.user.role === 'user') {
      whereClause = {
        id,
        accessControls: {
          some: {
            userId: req.user.id,
          },
        },
      };
    }

    const category = await prisma.category.findFirst({
      where: whereClause,
      include: {
        createdByAdmin: {
          select: { name: true, email: true },
        },
        folders: {
          include: {
            documents: true,
          },
        },
        accessControls: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found or access denied' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
