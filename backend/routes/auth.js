import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import whatsappService from '../services/whatsappService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shahi_poshak_secret_key_123';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'Customer', // Can specify 'Admin' if seeding, but default is 'Customer'
    });

    // Create token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current logged-in user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Get all customers (Admin only)
router.get('/customers', verifyToken, isAdmin, async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: 'Customer' },
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customers', error: error.message });
  }
});

// Register a manual walk-in customer/visitor (Admin only)
router.post('/customers', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required.' });
    }

    // Check if phone already exists
    const existingUser = await User.findOne({
      where: { phone }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'A customer with this phone number already exists.' });
    }

    const newUser = await User.create({
      name,
      phone,
      email: email || `${phone}@visitor.com`,
      password: 'manualpassword123', // Dummy password for visitor accounts
      role: 'Customer'
    });

    // Trigger Automated WhatsApp Lead Welcome Greeting
    await whatsappService.sendLeadGreeting(newUser);

    res.status(201).json({ message: 'Visitor registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error registering manual visitor', error: error.message });
  }
});

export default router;
