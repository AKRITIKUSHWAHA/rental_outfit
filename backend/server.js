import express from 'express';
import cors from 'cors';
import sequelize from './db.js';

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
  process.env.FRONTEND_URL, // Set this in Render dashboard
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
  .then(() => {
    console.log('SQLite database synced successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to sync SQLite database:', err);
  });
