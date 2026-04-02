import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    targetType: {
      type: String,
      enum: ["tenant", "property", "all"],
      default: "tenant",
    },
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    noticeType: {
      type: String,
      enum: ["general", "rent", "maintenance", "inspection", "warning"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NoticeSchema.index({ landlordId: 1 });
NoticeSchema.index({ tenantId: 1 });
NoticeSchema.index({ propertyId: 1 });

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
