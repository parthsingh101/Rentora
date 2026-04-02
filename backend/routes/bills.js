import TenantAssignment from '../models/TenantAssignment.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Helper to calculate total
const calculateTotal = (rent, electricity, extras) => {
  const extrasTotal = extras.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  return (Number(rent) || 0) + (Number(electricity) || 0) + extrasTotal;
};

// @route   POST /api/bills
// @desc    Create a monthly bill
router.post('/', protect, authorize('landlord', 'admin'), async (req, res) => {
  const { 
    tenantId, propertyId, unitId, 
    billingMonth, billingYear, 
    rentAmount, electricityBill, 
    extraCharges, dueDate, notes 
  } = req.body;

  try {
    // 1. Ownership check (if landlord)
    if (req.user.role === 'landlord') {
      const property = await Property.findById(propertyId);
      if (!property || property.landlordId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized for this property' });
      }
    }

    // 2. Prevent duplicate bills for the same month/year/unit
    const existingBill = await MonthlyBill.findOne({ unitId, billingMonth, billingYear });
    if (existingBill) {
      return res.status(400).json({ message: `A bill already exists for this unit in ${billingMonth} ${billingYear}` });
    }

    // 3. Calculate total
    const totalAmount = calculateTotal(rentAmount, electricityBill, extraCharges || []);

    const bill = new MonthlyBill({
      landlordId: req.user.id,
      tenantId,
      propertyId,
      unitId,
      billingMonth,
      billingYear,
      rentAmount,
      electricityBill,
      extraCharges,
      totalAmount,
      dueDate,
      notes,
      paymentStatus: 'pending'
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bills/landlord
// @desc    Get all bills for a landlord
router.get('/landlord', protect, authorize('landlord'), async (req, res) => {
  try {
    const bills = await MonthlyBill.find({ landlordId: req.user.id })
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'propertyName address')
      .populate('unitId', 'unitName')
      .sort({ createdAt: -1 });
    
    res.json(bills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bills/tenant
// @desc    Get all bills for a tenant
router.get('/tenant', protect, authorize('tenant'), async (req, res) => {
  try {
    const bills = await MonthlyBill.find({ tenantId: req.user.id })
      .populate('propertyId', 'propertyName address')
      .populate('unitId', 'unitName')
      .sort({ createdAt: -1 });
    
    res.json(bills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bills/:id
// @desc    Get bill details
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await MonthlyBill.findById(req.params.id)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'propertyName address city state pincode')
      .populate('unitId', 'unitName')
      .populate('landlordId', 'name email phone');

    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Authorization
    if (req.user.role === 'tenant' && bill.tenantId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'landlord' && bill.landlordId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/bills/:id/status
// @desc    Update bill payment status
router.patch('/:id/status', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const bill = await MonthlyBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (req.user.role === 'landlord' && bill.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bill.paymentStatus = req.body.status;
    await bill.save();
    res.json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/bills/:id
// @desc    Update a bill
router.put('/:id', protect, authorize('landlord', 'admin'), async (req, res) => {
  try {
    let bill = await MonthlyBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (req.user.role === 'landlord' && bill.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Recalculate total if amounts change
    const { rentAmount, electricityBill, extraCharges } = req.body;
    const totalAmount = calculateTotal(
      rentAmount || bill.rentAmount, 
      electricityBill !== undefined ? electricityBill : bill.electricityBill, 
      extraCharges || bill.extraCharges
    );

    req.body.totalAmount = totalAmount;

    bill = await MonthlyBill.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/bills/:id/proof
// @desc    Upload payment proof (Tenant only)
router.post('/:id/proof', protect, authorize('tenant'), upload.single('proof'), async (req, res) => {
  try {
    const bill = await MonthlyBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Ensure it's the tenant's own bill
    if (bill.tenantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to upload proof for this bill' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    bill.paymentProofUrl = `/uploads/proofs/${req.file.filename}`;
    bill.paymentProofNote = req.body.note || '';
    bill.paymentProofDate = new Date();
    bill.paymentStatus = 'proof_submitted';
    bill.rejectionReason = ''; // Clear any previous rejection reason

    await bill.save();
    res.json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/bills/:id/review
// @desc    Review and Approve/Reject payment proof (Landlord/Admin)
router.patch('/:id/review', protect, authorize('landlord', 'admin'), async (req, res) => {
  const { status, rejectionReason } = req.body;

  try {
    const bill = await MonthlyBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Authorization check for landlord
    if (req.user.role === 'landlord' && bill.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this property' });
    }

    if (status === 'paid') {
      bill.paymentStatus = 'paid';
      bill.rejectionReason = '';
    } else if (status === 'rejected') {
      bill.paymentStatus = 'pending';
      bill.rejectionReason = rejectionReason || 'Proof was insufficient';
    } else {
      return res.status(400).json({ message: 'Invalid status for review' });
    }

    await bill.save();
    res.json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
