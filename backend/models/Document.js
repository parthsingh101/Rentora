import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
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
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    documentType: {
      type: String,
      enum: ["agreement", "id_proof", "receipt", "notice", "other"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["tenant", "landlord_only", "shared"],
      default: "shared",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DocumentSchema.index({ landlordId: 1 });
DocumentSchema.index({ tenantId: 1 });
DocumentSchema.index({ propertyId: 1 });

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
