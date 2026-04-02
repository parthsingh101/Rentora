import mongoose from "mongoose";

const TenantAssignmentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlordId: {
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
    leaseStartDate: {
      type: Date,
      required: true,
    },
    leaseEndDate: {
      type: Date,
      required: true,
    },
    moveInDate: {
      type: Date,
      required: true,
    },
    moveOutDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "pending", "vacated"],
      default: "pending",
    },
    agreedMonthlyRent: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TenantAssignmentSchema.index({ tenantId: 1 });
TenantAssignmentSchema.index({ unitId: 1 });
TenantAssignmentSchema.index({ landlordId: 1 });
TenantAssignmentSchema.index({ status: 1 });

export default mongoose.models.TenantAssignment || mongoose.model("TenantAssignment", TenantAssignmentSchema);
