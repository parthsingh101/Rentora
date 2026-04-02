import express from 'express';
import Unit from '../models/Unit.js';
import Property from '../models/Property.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/properties/:propertyId/units
// @desc    Get all units for a specific property
router.get('/property/:propertyId', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Check ownership
    if (req.user.role !== 'admin' && property.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access these units' });
    }

    const units = await Unit.find({ propertyId: req.params.propertyId });
    res.json(units);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/units
// @desc    Create a new unit
router.post('/', protect, authorize('landlord'), async (req, res) => {
  const { propertyId, unitName, monthlyRent, securityDeposit, occupancyStatus, notes, applianceInventory } = req.body;

  try {
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add units to this property' });
    }

    const newUnit = new Unit({
      propertyId,
      landlordId: req.user.id,
      unitName,
      monthlyRent,
      securityDeposit,
      occupancyStatus,
      notes,
      applianceInventory
    });

    await newUnit.save();

    // Increment totalUnits in property
    property.totalUnits += 1;
    await property.save();

    res.status(201).json(newUnit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/units/:id
// @desc    Get unit by ID
router.get('/:id', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('propertyId');
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    if (req.user.role !== 'admin' && unit.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(unit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/units/:id
// @desc    Update a unit
router.put('/:id', protect, authorize('landlord'), async (req, res) => {
  try {
    let unit = await Unit.findById(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    if (unit.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(unit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/units/:id
// @desc    Delete a unit
router.delete('/:id', protect, authorize('landlord'), async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    if (unit.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Optional: Check for active assignments before deleting
    // const assignment = await TenantAssignment.findOne({ unitId: unit._id, status: 'active' });
    // if (assignment) return res.status(400).json({ message: 'Cannot delete unit with an active assignment' });

    const property = await Property.findById(unit.propertyId);
    if (property) {
      property.totalUnits -= 1;
      await property.save();
    }

    await Unit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Unit removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
