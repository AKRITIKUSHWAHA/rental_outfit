import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shahi_poshak_secret_key_123';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(403).json({ message: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized! Invalid token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.userRole === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Require Admin Role!' });
  }
};
