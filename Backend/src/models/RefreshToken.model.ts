import mongoose, { Document, Schema, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────

export interface IRefreshToken {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;       // SHA-256 hash of the raw token
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,   // Never expose raw hash in queries
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    userAgent: {
      type: String,
      select: false,
    },

    ipAddress: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

// ────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────

// TTL index: MongoDB automatically removes expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const RefreshToken: Model<IRefreshTokenDocument> = mongoose.model<IRefreshTokenDocument>(
  'RefreshToken',
  RefreshTokenSchema
);

export default RefreshToken;
