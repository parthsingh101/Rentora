import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import MaintenanceIssue from '../models/MaintenanceIssue.js';
import TenantAssignment from '../models/TenantAssignment.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for Issues
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/issues';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'issue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Invalid file type. Only Images and PDFs are allowed.'));
  }
});

// @route   POST /api/issues
// @desc    Report a new issue (Tenant only)
router.post('/', protect, authorize('tenant'), upload.single('image'), async (req, res) => {
  try {
    const { title, category, applianceName, description, priority } = req.body;

    // Find active assignment for this tenant
    const assignment = await TenantAssignment.findOne({ tenantId: req.user.id, status: 'active' });
    if (!assignment) return res.status(400).json({ message: 'No active property assignment found' });

    const issue = new MaintenanceIssue({
      tenantId: req.user.id,
      landlordId: assignment.landlordId,
      propertyId: assignment.propertyId,
      unitId: assignment.unitId,
      title,
      category,
      applianceName: applianceName || '',
      description,
      priority,
      imageUrl: req.file ? `/uploads/issues/${req.file.filename}` : '',
      status: 'open'
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/issues/tenant
// @desc    Get tenant's own issues
router.get('/tenant', protect, authorize('tenant'), async (req, res) => {
  try {
    const issues = await MaintenanceIssue.find({ tenantId: req.user.id })
      .populate('propertyId', 'propertyName')
      .populate('unitId', 'unitName')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/issues/landlord
// @desc    Get landlord's property issues
router.get('/landlord', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { landlordId: req.user.id };
    const issues = await MaintenanceIssue.find(query)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'propertyName')
      .populate('unitId', 'unitName')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/issues/:id
// @desc    Get issue details
router.get('/:id', protect, async (req, res) => {
  try {
    const issue = await MaintenanceIssue.findById(req.params.id)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'propertyName')
      .populate('unitId', 'unitName');

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Authorization
    if (req.user.role === 'tenant' && issue.tenantId._id.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'landlord' && issue.landlordId.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/issues/:id/status
// @desc    Update issue status (Landlord only)
router.patch('/:id/status', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const { status, landlordNotes } = req.body;
    const issue = await MaintenanceIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    if (req.user.role === 'landlord' && issue.landlordId.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    issue.status = status || issue.status;
    issue.landlordNotes = landlordNotes || issue.landlordNotes;

    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
