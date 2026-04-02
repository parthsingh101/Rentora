import mongoose from "mongoose";

const MaintenanceIssueSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    applianceName: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    landlordNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MaintenanceIssueSchema.index({ landlordId: 1 });
MaintenanceIssueSchema.index({ tenantId: 1 });
MaintenanceIssueSchema.index({ status: 1 });

export default mongoose.models.MaintenanceIssue || mongoose.model("MaintenanceIssue", MaintenanceIssueSchema);
