import User from './User.js';
import Outfit from './Outfit.js';
import Booking from './Booking.js';
import WhatsAppLog from './WhatsAppLog.js';
import WhatsAppTemplate from './WhatsAppTemplate.js';

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Outfit <-> Booking
Outfit.hasMany(Booking, { foreignKey: 'outfitId', as: 'bookings' });
Booking.belongsTo(Outfit, { foreignKey: 'outfitId', as: 'outfit' });

export {
  User,
  Outfit,
  Booking,
  WhatsAppLog,
  WhatsAppTemplate
};

