import express from 'express';
import Notice from '../models/Notice.js';
import TenantAssignment from '../models/TenantAssignment.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/notices
// @desc    Create a new notice (Landlord only)
router.post('/', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const { title, message, noticeType, targetType, tenantId, propertyId } = req.body;

    const notice = new Notice({
      landlordId: req.user.id,
      tenantId: targetType === 'tenant' ? tenantId : null,
      propertyId: targetType === 'property' ? propertyId : null,
      targetType,
      title,
      message,
      noticeType
    });

    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/notices/landlord
// @desc    Get sent notices for landlord
router.get('/landlord', protect, authorize('landlord'), async (req, res) => {
  try {
    const notices = await Notice.find({ landlordId: req.user.id })
      .populate('tenantId', 'name email')
      .populate('propertyId', 'propertyName')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/notices/tenant
// @desc    Get relevant notices for tenant
router.get('/tenant', protect, authorize('tenant'), async (req, res) => {
  try {
    // Find tenant's active assignment to get property and landlord
    const assignment = await TenantAssignment.findOne({ tenantId: req.user.id, status: 'active' });
    
    let query = {
      $or: [
        { tenantId: req.user.id, targetType: 'tenant' }
      ]
    };

    if (assignment) {
      query.$or.push({ propertyId: assignment.propertyId, targetType: 'property' });
      query.$or.push({ landlordId: assignment.landlordId, targetType: 'all' });
    }

    const notices = await Notice.find(query)
      .populate('landlordId', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(notices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/notices/admin
// @desc    Get all notices for admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('landlordId', 'name email')
      .populate('tenantId', 'name email')
      .populate('propertyId', 'propertyName')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/notices/:id
// @desc    Get notice details
router.get('/:id', protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('landlordId', 'name email')
      .populate('propertyId', 'propertyName');

    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    // Authorization skip for admin
    if (req.user.role === 'tenant') {
       // Check if this notice belongs to them via the same $or logic roughly
       if (notice.targetType === 'tenant' && notice.tenantId?.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized' });
       }
       // (Simplified for MVP, usually we'd re-verify the assignment here too)
    }

    res.json(notice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/notices/:id/read
// @desc    Mark as read
router.patch('/:id/read', protect, authorize('tenant'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    notice.isRead = true;
    await notice.save();
    res.json(notice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
