import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Outfit = sequelize.define('Outfit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rentalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  securityDeposit: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  images: {
    type: DataTypes.TEXT, // Comma-separated list of image paths or JSON string
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Available', 'Maintenance', 'Rented', 'Retired'),
    defaultValue: 'Available',
  },
}, {
  timestamps: true,
});

export default Outfit;
