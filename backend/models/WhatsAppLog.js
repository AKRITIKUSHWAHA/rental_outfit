import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const WhatsAppLog = sequelize.define('WhatsAppLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  recipientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recipientPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  messageType: {
    type: DataTypes.ENUM('Booking Confirmation', 'Status Update', 'Lead Greeting', 'Manual'),
    allowNull: false,
  },
  messageText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Sent', 'Delivered', 'Failed'),
    defaultValue: 'Sent',
    allowNull: false,
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default WhatsAppLog;
