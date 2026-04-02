import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import Property from '../models/Property.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for Documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/documents';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Invalid file type. Only Images, PDFs, and Word docs are allowed.'));
  }
});

// @route   POST /api/documents
// @desc    Upload a new document (Landlord only)
router.post('/', protect, authorize('landlord', 'admin'), upload.single('file'), async (req, res) => {
  try {
    const { title, documentType, visibility, tenantId, propertyId, unitId } = req.body;

    if (!req.file) return res.status(400).json({ message: 'Please upload a document' });

    const document = new Document({
      landlordId: req.user.id,
      tenantId: tenantId || null,
      propertyId: propertyId || null,
      unitId: unitId || null,
      documentType,
      title,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      visibility: visibility || 'shared'
    });

    await document.save();
    res.status(201).json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/documents/landlord
// @desc    Get all documents for a landlord
router.get('/landlord', protect, authorize('landlord'), async (req, res) => {
  try {
    const documents = await Document.find({ landlordId: req.user.id })
      .populate('tenantId', 'name email')
      .populate('propertyId', 'propertyName')
      .populate('unitId', 'unitName')
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/documents/tenant
// @desc    Get all documents for a tenant (filtered by visibility)
router.get('/tenant', protect, authorize('tenant'), async (req, res) => {
  try {
    // Shared or specifically for this tenant
    const documents = await Document.find({
      tenantId: req.user.id,
      visibility: { $in: ['tenant', 'shared'] }
    })
    .populate('landlordId', 'name email phone')
    .populate('propertyId', 'propertyName address')
    .populate('unitId', 'unitName')
    .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/documents/:id
// @desc    Get document details
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('landlordId', 'name email')
      .populate('tenantId', 'name email')
      .populate('propertyId', 'propertyName');

    if (!document) return res.status(404).json({ message: 'Document not found' });

    // Authorization
    if (req.user.role === 'tenant') {
       if (document.tenantId?._id.toString() !== req.user.id || document.visibility === 'landlord_only') {
          return res.status(403).json({ message: 'Not authorized' });
       }
    }
    if (req.user.role === 'landlord' && document.landlordId._id.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
router.delete('/:id', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    if (req.user.role === 'landlord' && document.landlordId.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    // Optional: Delete physical file
    const filePath = path.join(process.cwd(), document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
