import express from 'express';
import { Booking, Outfit, User } from '../models/index.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import whatsappService from '../services/whatsappService.js';

const router = express.Router();

// Create new booking (Customer)
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      outfitId,
      startDate,
      endDate,
      bustSize,
      waistSize,
      hipsSize,
      lengthSize,
      height,
      shippingAddress,
      paymentMethod,
      paymentDetails
    } = req.body;

    // Check if outfit exists and is available
    const outfit = await Outfit.findByPk(outfitId);
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    if (outfit.status === 'Retired') {
      return res.status(400).json({ message: 'Outfit is no longer available for rent' });
    }

    // Verify dates availability (Optional but good check: check if outfit is already booked in that range)
    // For simplicity of local testing and simulation, we will allow simultaneous mock bookings
    // but in production we would query Booking where outfitId and overlap dates.
    
    // Calculate rental total
    const totalAmount = outfit.rentalPrice + outfit.securityDeposit;

    const newBooking = await Booking.create({
      userId: req.userId,
      outfitId,
      startDate,
      endDate,
      totalAmount,
      securityDeposit: outfit.securityDeposit,
      status: 'Pending',
      bustSize,
      waistSize,
      hipsSize,
      lengthSize,
      height,
      shippingAddress,
      paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Paid', 
      paymentMethod: paymentMethod || 'Online',
      paymentDetails: paymentDetails || (paymentMethod === 'Cash' ? 'Cash on Delivery' : 'Simulated Payment API')
    });

    // Trigger Automated WhatsApp Notification
    const customer = await User.findByPk(req.userId);
    if (customer) {
      await whatsappService.sendBookingConfirmation(newBooking, customer, outfit);
    }

    // Optionally mark outfit as Rented, though we update it dynamically based on dispatch
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get current user's bookings (Customer)
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Outfit,
          as: 'outfit',
          attributes: ['name', 'images', 'rentalPrice', 'securityDeposit']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving your bookings', error: error.message });
  }
});

// Get all bookings (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Outfit,
          as: 'outfit',
          attributes: ['id', 'name', 'images', 'rentalPrice', 'securityDeposit', 'status']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving all bookings', error: error.message });
  }
});

// Get specific booking details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Outfit,
          as: 'outfit'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security check: Only admin or the booker can view
    if (req.userRole !== 'Admin' && booking.userId !== req.userId) {
      return res.status(403).json({ message: 'Access denied to this booking' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving booking details', error: error.message });
  }
});

// Update booking status (Admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'Pending',
      'Approved',
      'Alteration',
      'Dispatched',
      'Delivered',
      'Returned',
      'Refunded',
      'Completed',
      'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Outfit, as: 'outfit' }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status
    await booking.update({ status });

    // Side-effects on Outfit status based on booking status transitions
    if (booking.outfit) {
      if (status === 'Alteration') {
        await booking.outfit.update({ status: 'Maintenance' });
      } else if (status === 'Dispatched' || status === 'Delivered') {
        await booking.outfit.update({ status: 'Rented' });
      } else if (status === 'Returned' || status === 'Refunded' || status === 'Completed') {
        await booking.outfit.update({ status: 'Available' });
      }
    }

    // If status is 'Refunded', update payment status as well
    if (status === 'Refunded') {
      await booking.update({ paymentStatus: 'Refunded' });
    }

    // Trigger Automated WhatsApp Status Notification
    const customer = await User.findByPk(booking.userId);
    if (customer) {
      await whatsappService.sendBookingStatusUpdate(booking, customer, booking.outfit);
    }

    res.status(200).json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
});

// Create booking manually (Admin walk-in booking)
router.post('/manual', verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      outfitId,
      startDate,
      endDate,
      bustSize,
      waistSize,
      hipsSize,
      lengthSize,
      height,
      shippingAddress,
      paymentMethod,
      paymentDetails
    } = req.body;

    if (!customerName || !customerPhone || !outfitId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Determine target email
    const email = customerEmail || `${customerPhone}@manual.krrentaloutfits.com`;

    // Try finding existing user by phone or email
    let user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { phone: customerPhone },
          { email: email }
        ]
      } 
    });

    // Create user if not existing
    if (!user) {
      const hashedPassword = bcrypt.hashSync('manual123', 10);
      user = await User.create({
        name: customerName,
        email: email,
        phone: customerPhone,
        password: hashedPassword,
        role: 'Customer'
      });
    }

    // Verify outfit
    const outfit = await Outfit.findByPk(outfitId);
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    if (outfit.status === 'Retired') {
      return res.status(400).json({ message: 'Outfit is retired and cannot be rented' });
    }

    const totalAmount = outfit.rentalPrice + outfit.securityDeposit;

    const newBooking = await Booking.create({
      userId: user.id,
      outfitId,
      startDate,
      endDate,
      totalAmount,
      securityDeposit: outfit.securityDeposit,
      status: 'Approved', // Auto-approved for manual booking
      bustSize,
      waistSize,
      hipsSize,
      lengthSize,
      height,
      shippingAddress: shippingAddress || 'Picked up in Store',
      paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Paid',
      paymentMethod: paymentMethod || 'Cash',
      paymentDetails: paymentDetails || 'Manual Walk-in Booking'
    });

    // Trigger Automated WhatsApp Confirmation
    await whatsappService.sendBookingConfirmation(newBooking, user, outfit);

    // Optionally mark outfit as rented or maintenance depending on dates
    // For simplicity, keep as is

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating manual booking', error: error.message });
  }
});

export default router;
