import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  outfitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  securityDeposit: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'Pending',
      'Approved',
      'Alteration',
      'Dispatched',
      'Delivered',
      'Returned',
      'Refunded',
      'Completed',
      'Cancelled'
    ),
    defaultValue: 'Pending',
  },
  // Custom Alteration Sizes (in inches)
  bustSize: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  waistSize: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  hipsSize: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  lengthSize: {
    type: DataTypes.FLOAT, // Waist to floor length
    allowNull: true,
  },
  height: {
    type: DataTypes.FLOAT, // height in feet or cm
    allowNull: true,
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Refunded'),
    defaultValue: 'Pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('Online', 'Cash'),
    defaultValue: 'Online',
    allowNull: false,
  },
  paymentDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Booking;
