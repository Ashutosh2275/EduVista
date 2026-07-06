import mongoose, { Document, Schema, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────

export interface ICompareSelection {
  userId: mongoose.Types.ObjectId;
  colleges: mongoose.Types.ObjectId[]; // References College model, max 3 items
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompareSelectionDocument extends ICompareSelection, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────

const CompareSelectionSchema = new Schema<ICompareSelectionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required.'],
      unique: true, // One comparison selection document per user
      index: true,
    },

    colleges: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'College',
        },
      ],
      validate: [
        (val: any[]) => val.length <= 3,
        'You can compare up to 3 colleges only.',
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────

CompareSelectionSchema.index({ userId: 1 }, { unique: true });

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const CompareSelection: Model<ICompareSelectionDocument> = mongoose.model<ICompareSelectionDocument>(
  'CompareSelection',
  CompareSelectionSchema
);

export default CompareSelection;
