import bcrypt from 'bcryptjs';
import sequelize from './db.js';
import { User, Outfit, Booking, WhatsAppTemplate } from './models/index.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected. Syncing models...');
    // Sync models (drop tables and recreate them to start clean)
    await sequelize.sync({ force: true });
    console.log('Database tables cleared and recreated.');

    // 1. Create Admin User
    const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin KR Rental Outfits',
      email: 'admin@krrentaloutfits.com',
      password: hashedAdminPassword,
      phone: '9183170731',
      role: 'Admin',
    });
    console.log('Seeded Admin: admin@krrentaloutfits.com / admin123');

    // 2. Create Test Customer User
    const hashedUserPassword = bcrypt.hashSync('user123', 10);
    const customerUser = await User.create({
      name: 'Aisha Sharma',
      email: 'aisha@example.com',
      password: hashedUserPassword,
      phone: '8765432109',
      role: 'Customer',
    });
    console.log('Seeded Customer: aisha@example.com / user123');

    // 3. Create Sample Lehenga Outfits
    const outfits = [
      {
        name: 'Shahi Crimson Bridal Lehenga',
        description: 'A luxurious crimson red raw silk bridal lehenga, heavily embroidered with zardozi, hand-stitched sequins, and gold zari thread work. Perfect for weddings, it features a grand flare, a matching blouse, and double net sheer gold border dupattas.',
        category: 'Bridal Lehenga',
        size: 'M',
        color: 'Crimson Red & Gold',
        rentalPrice: 4500.00,
        securityDeposit: 10000.00,
        images: '/images/lehenga_crimson.png',
        status: 'Available'
      },
      {
        name: 'Emerald Velvet Zardozi Lehenga',
        description: 'An elegant royal emerald green velvet lehenga decorated with heavy silver and gold zardozi panel embroidery. Includes a sweetheart neckline blouse and a matching heavy organza dupatta. Designed for reception or sangeet night.',
        category: 'Bridal Lehenga',
        size: 'L',
        color: 'Emerald Green',
        rentalPrice: 4200.00,
        securityDeposit: 9000.00,
        images: '/images/lehenga_emerald.png',
        status: 'Available'
      },
      {
        name: 'Blush Pink Organza Lehenga',
        description: 'A light-weight, modern pastel blush pink lehenga made of premium organza fabric. Decorated with delicate floral print, hand-embellished mirrors, and pearl borders. Ideal for daytime weddings, mehndi, or sangeet.',
        category: 'Sangeet Lehenga',
        size: 'S',
        color: 'Blush Pink',
        rentalPrice: 3000.00,
        securityDeposit: 6000.00,
        images: '/images/lehenga_pink.png',
        status: 'Available'
      },
      {
        name: 'Royal Blue Mirror Work Lehenga',
        description: 'A vibrant royal blue georgette lehenga featuring extensive hand-worked mirror layouts and intricate silver resham thread work. Comes with a sleeveless crop top style blouse and a net dupatta. A showstopper for sangeet or wedding guest wear.',
        category: 'Party Wear Lehenga',
        size: 'M',
        color: 'Royal Blue',
        rentalPrice: 2500.00,
        securityDeposit: 5000.00,
        images: '/images/lehenga_blue.png',
        status: 'Available'
      }
    ];

    const createdOutfits = await Outfit.bulkCreate(outfits);
    console.log('Seeded 4 premium Lehenga outfits successfully.');

    // 4. Create sample Bookings to demonstrate Online vs Cash
    const booking1 = await Booking.create({
      userId: customerUser.id,
      outfitId: createdOutfits[0].id, // Crimson Bridal Lehenga
      startDate: '2026-08-20',
      endDate: '2026-08-23',
      totalAmount: 14500.00, // 4500 + 10000
      securityDeposit: 10000.00,
      status: 'Pending',
      bustSize: 34.5,
      waistSize: 28.0,
      hipsSize: 38.0,
      lengthSize: 42.0,
      height: 5.4,
      shippingAddress: 'Flat 405, Orchid Heights, Sector 62, Noida, UP - 201301',
      paymentStatus: 'Paid',
      paymentMethod: 'Online',
      paymentDetails: 'Simulated UPI Transaction: tx_82710382'
    });

    const booking2 = await Booking.create({
      userId: customerUser.id,
      outfitId: createdOutfits[1].id, // Emerald Velvet Zardozi Lehenga
      startDate: '2026-09-01',
      endDate: '2026-09-04',
      totalAmount: 13200.00, // 4200 + 9000
      securityDeposit: 9000.00,
      status: 'Approved',
      bustSize: 36.0,
      waistSize: 30.0,
      hipsSize: 40.0,
      lengthSize: 44.0,
      height: 5.6,
      shippingAddress: 'Flat 405, Orchid Heights, Sector 62, Noida, UP - 201301',
      paymentStatus: 'Pending',
      paymentMethod: 'Cash',
      paymentDetails: 'Cash on Delivery (COD)'
    });
    console.log('Seeded sample bookings (1 Online, 1 Cash) for Aisha.');

    // 5. Create Default WhatsApp Templates
    const templates = [
      {
        id: 'booking_confirmation',
        title: 'Booking Confirmed Alert',
        body: 'Hello {name},\n\nYour rental booking for {outfit} has been received! \n📅 Dates: {startDate} to {endDate}\n💰 Total Amount: ₹{totalAmount}\n\nThank you for choosing KR Rental Outfits!',
        variables: '{name},{outfit},{startDate},{endDate},{totalAmount},{bookingId}'
      },
      {
        id: 'status_update',
        title: 'Booking Status Update Alert',
        body: 'Hello {name},\n\nYour rental booking #{bookingId} ({outfit}) status has been updated to: *{status}*.\n\nThank you for renting with KR Rental Outfits!',
        variables: '{name},{bookingId},{outfit},{status}'
      },
      {
        id: 'lead_greeting',
        title: 'Walk-in Visitor Lead Welcome',
        body: `Hello {name},\n\nThank you for visiting KR Rental Outfits today! \n\nYou can explore our designer catalog and rent outfits online here: ${process.env.FRONTEND_URL || 'https://your-site.netlify.app'}/catalog \n\nWe look forward to serving you!`,
        variables: '{name}'
      }
    ];

    await WhatsAppTemplate.bulkCreate(templates);
    console.log('Seeded default WhatsApp templates.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
