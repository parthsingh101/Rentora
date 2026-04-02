import mongoose from "mongoose";

const MonthlyBillSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    billingMonth: {
      type: String, // e.g., "January"
      required: true,
    },
    billingYear: {
      type: Number, // e.g., 2024
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    electricityBill: {
      type: Number,
      default: 0,
    },
    extraCharges: [
      {
        label: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "overdue", "partial"],
      default: "pending",
    },
    paymentProofUrl: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MonthlyBillSchema.index({ tenantId: 1, billingMonth: 1, billingYear: 1 });
MonthlyBillSchema.index({ landlordId: 1 });
MonthlyBillSchema.index({ paymentStatus: 1 });

export default mongoose.models.MonthlyBill || mongoose.model("MonthlyBill", MonthlyBillSchema);
