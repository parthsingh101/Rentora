import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import TenantAssignment from '../models/TenantAssignment.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/tenants/create
// @desc    Admin/Landlord creates a new tenant user account
router.post('/create', protect, authorize('landlord', 'admin'), async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password || 'Welcome@Rentora123', salt);

    user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: 'tenant'
    });

    await user.save();

    res.status(201).json({
      message: 'Tenant account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/tenants/search
// @desc    Search for existing tenants by email
router.get('/search', protect, authorize('landlord', 'admin'), async (req, res) => {
  const { email } = req.query;

  try {
    const users = await User.find({ 
      email: { $regex: email, $options: 'i' },
      role: 'tenant' 
    }).select('name email role phone');
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/tenants
// @desc    Get all tenants associated with the landlord's properties
router.get('/', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'landlord') {
      // Find assignments for this landlord
      const assignments = await TenantAssignment.find({ landlordId: req.user.id }).select('tenantId');
      const tenantIds = assignments.map(a => a.tenantId);
      query = { _id: { $in: tenantIds } };
    }

    const tenants = await User.find({ ...query, role: 'tenant' }).select('-passwordHash');
    res.json(tenants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/tenants/:id
// @desc    Get tenant details and assignment history
router.get('/:id', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const tenant = await User.findById(req.params.id).select('-passwordHash');
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Check if landlord has access to this tenant (via assignment)
    if (req.user.role === 'landlord') {
      const hasAssignment = await TenantAssignment.findOne({ 
        tenantId: tenant._id, 
        landlordId: req.user.id 
      });
      if (!hasAssignment) return res.status(403).json({ message: 'Not authorized to view this tenant' });
    }

    const assignments = await TenantAssignment.find({ tenantId: tenant._id })
      .populate('propertyId', 'propertyName address')
      .populate('unitId', 'unitName');

    res.json({ tenant, assignments });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
