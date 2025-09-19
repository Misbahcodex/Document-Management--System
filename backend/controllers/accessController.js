const prisma = require('../config/database');

const grantAccess = async (req, res) => {
  try {
    const { categoryId, userId, accessType } = req.body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if access already exists
    const existingAccess = await prisma.accessControl.findUnique({
      where: {
        categoryId_userId: {
          categoryId,
          userId,
        },
      },
    });

    let accessControl;
    if (existingAccess) {
      // Update existing access
      accessControl = await prisma.accessControl.update({
        where: {
          categoryId_userId: {
            categoryId,
            userId,
          },
        },
        data: {
          accessType,
        },
        include: {
          category: {
            select: { name: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
      });
    } else {
      // Create new access
      accessControl = await prisma.accessControl.create({
        data: {
          categoryId,
          userId,
          accessType,
        },
        include: {
          category: {
            select: { name: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
      });
    }

    res.status(201).json({
      message: 'Access granted successfully',
      accessControl,
    });
  } catch (error) {
    console.error('Grant access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const revokeAccess = async (req, res) => {
  try {
    const { categoryId, userId } = req.body;

    const accessControl = await prisma.accessControl.findUnique({
      where: {
        categoryId_userId: {
          categoryId,
          userId,
        },
      },
    });

    if (!accessControl) {
      return res.status(404).json({ error: 'Access control not found' });
    }

    await prisma.accessControl.delete({
      where: {
        categoryId_userId: {
          categoryId,
          userId,
        },
      },
    });

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        accessControls: {
          include: {
            category: {
              select: { name: true },
            },
          },
        },
      },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserAccess = async (req, res) => {
  try {
    const { userId } = req.params;

    const userAccess = await prisma.accessControl.findMany({
      where: { userId },
      include: {
        category: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    res.json({ userAccess });
  } catch (error) {
    console.error('Get user access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCategoryAccess = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const categoryAccess = await prisma.accessControl.findMany({
      where: { categoryId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ categoryAccess });
  } catch (error) {
    console.error('Get category access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  grantAccess,
  revokeAccess,
  getAllUsers,
  getUserAccess,
  getCategoryAccess,
};
