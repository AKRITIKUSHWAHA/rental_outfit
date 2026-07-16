import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import sequelize from './db.js';
import { User, Outfit, WhatsAppTemplate } from './models/index.js';

// Route Imports
import authRoutes from './routes/auth.js';
import outfitRoutes from './routes/outfits.js';
import bookingRoutes from './routes/bookings.js';
import whatsappRoutes from './routes/whatsapp.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — Allow frontend origins (local + Netlify)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://krrentaloutfitbookingcom.netlify.app', // Production Netlify URL
  process.env.FRONTEND_URL, // Optional override via Render env variable
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Serve static images from public folder
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'KR Rental Outfits Server is running!' });
});

// Database Sync and Server Startup
sequelize
  .sync()
  .then(async () => {
    console.log('SQLite database synced successfully.');

    // Start server first — always
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Auto-seed in background — only if DB is empty
    try {
      const userCount = await User.count();
      if (userCount === 0) {
        console.log('Empty DB detected — running auto-seed...');

        await User.create({
          name: 'Admin KR Rental Outfits',
          email: 'admin@krrentaloutfits.com',
          password: bcrypt.hashSync('admin123', 10),
          phone: '9183170731',
          role: 'Admin',
        });

        await User.create({
          name: 'Aisha Sharma',
          email: 'aisha@example.com',
          password: bcrypt.hashSync('user123', 10),
          phone: '8765432109',
          role: 'Customer',
        });

        await Outfit.bulkCreate([
          { name: 'Shahi Crimson Bridal Lehenga', description: 'A luxurious crimson red raw silk bridal lehenga.', category: 'Bridal Lehenga', size: 'M', color: 'Crimson Red & Gold', rentalPrice: 4500.00, securityDeposit: 10000.00, images: '/images/lehenga_crimson.png', status: 'Available' },
          { name: 'Emerald Velvet Zardozi Lehenga', description: 'An elegant royal emerald green velvet lehenga.', category: 'Bridal Lehenga', size: 'L', color: 'Emerald Green', rentalPrice: 4200.00, securityDeposit: 9000.00, images: '/images/lehenga_emerald.png', status: 'Available' },
          { name: 'Blush Pink Organza Lehenga', description: 'A light-weight, modern pastel blush pink lehenga.', category: 'Sangeet Lehenga', size: 'S', color: 'Blush Pink', rentalPrice: 3000.00, securityDeposit: 6000.00, images: '/images/lehenga_pink.png', status: 'Available' },
          { name: 'Royal Blue Mirror Work Lehenga', description: 'A vibrant royal blue georgette lehenga.', category: 'Party Wear Lehenga', size: 'M', color: 'Royal Blue', rentalPrice: 2500.00, securityDeposit: 5000.00, images: '/images/lehenga_blue.png', status: 'Available' },
        ]);

        await WhatsAppTemplate.bulkCreate([
          { id: 'booking_confirmation', title: 'Booking Confirmed Alert', body: 'Hello {name},\n\nYour rental booking for {outfit} has been received!\nDates: {startDate} to {endDate}\nTotal Amount: Rs.{totalAmount}\n\nThank you for choosing KR Rental Outfits!', variables: '{name},{outfit},{startDate},{endDate},{totalAmount},{bookingId}' },
          { id: 'status_update', title: 'Booking Status Update Alert', body: 'Hello {name},\n\nYour booking #{bookingId} ({outfit}) status updated to: {status}.\n\nThank you!', variables: '{name},{bookingId},{outfit},{status}' },
          { id: 'lead_greeting', title: 'Walk-in Visitor Lead Welcome', body: 'Hello {name},\n\nThank you for visiting KR Rental Outfits!\n\nExplore our catalog online!', variables: '{name}' },
        ]);

        console.log('Auto-seed complete! Admin: admin@krrentaloutfits.com / admin123');
      } else {
        console.log(`DB already has ${userCount} user(s) — skipping seed.`);
      }
    } catch (seedErr) {
      console.error('Auto-seed error (server still running):', seedErr.message);
    }
  })
  .catch((err) => {
    console.error('Unable to sync SQLite database:', err);
  });
