import express from 'express';
import { Outfit } from '../models/index.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all outfits (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, size, color, maxPrice, search } = req.query;
    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }
    if (size) {
      whereClause.size = size;
    }
    if (color) {
      whereClause.color = { [Op.like]: `%${color}%` };
    }
    if (maxPrice) {
      whereClause.rentalPrice = { [Op.lte]: parseFloat(maxPrice) };
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Only show available/maintenance/rented outfits for catalog, omit retired unless admin
    // For simplicity, display all non-retired outfits
    whereClause.status = { [Op.ne]: 'Retired' };

    const outfits = await Outfit.findAll({ where: whereClause });
    res.status(200).json(outfits);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving outfits', error: error.message });
  }
});

// Get a single outfit by ID
router.get('/:id', async (req, res) => {
  try {
    const outfit = await Outfit.findByPk(req.params.id);
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    res.status(200).json(outfit);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving outfit details', error: error.message });
  }
});

// Create new outfit (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, category, size, color, rentalPrice, securityDeposit, images, status } = req.body;
    
    if (!name || !category || !size || !color || rentalPrice === undefined || securityDeposit === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newOutfit = await Outfit.create({
      name,
      description,
      category,
      size,
      color,
      rentalPrice,
      securityDeposit,
      images, // comma-separated strings or URLs
      status: status || 'Available'
    });

    res.status(201).json(newOutfit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating outfit', error: error.message });
  }
});

// Update outfit (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, category, size, color, rentalPrice, securityDeposit, images, status } = req.body;
    const outfit = await Outfit.findByPk(req.params.id);

    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    await outfit.update({
      name: name !== undefined ? name : outfit.name,
      description: description !== undefined ? description : outfit.description,
      category: category !== undefined ? category : outfit.category,
      size: size !== undefined ? size : outfit.size,
      color: color !== undefined ? color : outfit.color,
      rentalPrice: rentalPrice !== undefined ? rentalPrice : outfit.rentalPrice,
      securityDeposit: securityDeposit !== undefined ? securityDeposit : outfit.securityDeposit,
      images: images !== undefined ? images : outfit.images,
      status: status !== undefined ? status : outfit.status
    });

    res.status(200).json(outfit);
  } catch (error) {
    res.status(500).json({ message: 'Error updating outfit', error: error.message });
  }
});

// Delete outfit (Soft delete by changing status to 'Retired', Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const outfit = await Outfit.findByPk(req.params.id);
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    // Soft delete to preserve booking references
    await outfit.update({ status: 'Retired' });
    res.status(200).json({ message: 'Outfit retired successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting outfit', error: error.message });
  }
});

export default router;
