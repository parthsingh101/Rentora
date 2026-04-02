import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyName: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    propertyType: {
      type: String,
      enum: ["house", "apartment", "flat", "pg", "room"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    totalUnits: {
      type: Number,
      default: 0,
    },
    occupiedUnits: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
PropertySchema.index({ landlordId: 1 });
PropertySchema.index({ city: 1 });

export default mongoose.models.Property || mongoose.model("Property", PropertySchema);
