import express from 'express';
import TenantAssignment from '../models/TenantAssignment.js';
import Property from '../models/Property.js';
import Unit from '../models/Unit.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/assignments
// @desc    Assign a tenant to a unit
router.post('/', protect, authorize('landlord'), async (req, res) => {
  const { tenantId, propertyId, unitId, leaseStartDate, leaseEndDate, moveInDate, agreedMonthlyRent, securityDeposit } = req.body;

  try {
    // 1. Verify property ownership
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to assign tenants to this property' });
    }

    // 2. Verify unit availability
    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    if (unit.occupancyStatus === 'occupied') {
      return res.status(400).json({ message: 'This unit is already occupied' });
    }

    // 3. Create assignment
    const assignment = new TenantAssignment({
      tenantId,
      landlordId: req.user.id,
      propertyId,
      unitId,
      leaseStartDate,
      leaseEndDate,
      moveInDate,
      agreedMonthlyRent,
      securityDeposit,
      status: 'active'
    });

    await assignment.save();

    // 4. Update unit occupancy
    unit.occupancyStatus = 'occupied';
    await unit.save();

    // 5. Update property stats
    property.occupiedUnits += 1;
    await property.save();

    res.status(201).json(assignment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/assignments/:id/vacate
// @desc    Mark assignment as vacated and free the unit
router.put('/:id/vacate', protect, authorize('landlord'), async (req, res) => {
  try {
    const assignment = await TenantAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (assignment.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (assignment.status === 'vacated') {
      return res.status(400).json({ message: 'Tenant has already vacated' });
    }

    // 1. Mark assignment as vacated
    assignment.status = 'vacated';
    assignment.moveOutDate = new Date();
    await assignment.save();

    // 2. Free the unit
    const unit = await Unit.findById(assignment.unitId);
    if (unit) {
      unit.occupancyStatus = 'vacant';
      await unit.save();
    }

    // 3. Update property stats
    const property = await Property.findById(assignment.propertyId);
    if (property) {
      property.occupiedUnits = Math.max(0, property.occupiedUnits - 1);
      await property.save();
    }

    res.json({ message: 'Tenant vacated successfully and unit is now available' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/assignments
// @desc    Get all current landlord assignments
router.get('/', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'landlord') {
      query = { landlordId: req.user.id };
    }

    const assignments = await TenantAssignment.find(query)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'propertyName address')
      .populate('unitId', 'unitName')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
