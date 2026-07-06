import mongoose, { Document, Schema, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────

export interface IAuditLog {
  adminId: mongoose.Types.ObjectId; // References User model
  action: string; // e.g. 'ADMIN_LOGIN', 'COLLEGE_CREATE', 'ROLE_CHANGE'
  resource: 'User' | 'College' | 'Course' | 'Enquiry' | 'Settings';
  resourceId?: string;
  details: Schema.Types.Mixed; // Store change details or metadata
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required.'],
      index: true,
    },

    action: {
      type: String,
      required: [true, 'Action description is required.'],
      trim: true,
    },

    resource: {
      type: String,
      enum: ['User', 'College', 'Course', 'Enquiry', 'Settings'],
      required: [true, 'Resource category is required.'],
    },

    resourceId: {
      type: String,
      default: null,
    },

    details: {
      type: Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      trim: true,
    },

    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Store creation timestamp only
    versionKey: false,
  }
);

// ────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────

AuditLogSchema.index({ adminId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const AuditLog: Model<IAuditLogDocument> = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;
