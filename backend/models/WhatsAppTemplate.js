import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const WhatsAppTemplate = sequelize.define('WhatsAppTemplate', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  variables: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default WhatsAppTemplate;
