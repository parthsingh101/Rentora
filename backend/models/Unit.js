import mongoose from "mongoose";

const UnitSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unitName: {
      type: String,
      required: [true, "Unit name is required"],
      trim: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
    occupancyStatus: {
      type: String,
      enum: ["vacant", "occupied", "maintenance"],
      default: "vacant",
    },
    applianceInventory: [
      {
        name: { type: String, required: true },
        category: { type: String },
        status: { type: String, default: "working" },
      },
    ],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UnitSchema.index({ propertyId: 1 });
UnitSchema.index({ landlordId: 1 });

export default mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
