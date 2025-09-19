const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const prisma = require('../config/database');

const registerSystemAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.systemAdmin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'System Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await prisma.systemAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'system_admin',
    });

    res.status(201).json({
      message: 'System Admin created successfully',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'system_admin',
      },
    });
  } catch (error) {
    console.error('System Admin registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginSystemAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await prisma.systemAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'system_admin',
    });

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'system_admin',
      },
    });
  } catch (error) {
    console.error('System Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'user',
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'user',
      },
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'user',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'user',
      },
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  res.json({
    user: req.user,
  });
};

module.exports = {
  registerSystemAdmin,
  loginSystemAdmin,
  registerUser,
  loginUser,
  getCurrentUser,
};
