import mongoose, { Document, Schema, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────

export interface IWishlist {
  userId: mongoose.Types.ObjectId;
  colleges: mongoose.Types.ObjectId[]; // References College model
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlistDocument extends IWishlist, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────

const WishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required.'],
      unique: true, // One wishlist document per user
      index: true,
    },

    colleges: [
      {
        type: Schema.Types.ObjectId,
        ref: 'College',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────

WishlistSchema.index({ userId: 1 }, { unique: true });
WishlistSchema.index({ colleges: 1 }); // Index for fast lookup of users who wishlisted a college

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const Wishlist: Model<IWishlistDocument> = mongoose.model<IWishlistDocument>('Wishlist', WishlistSchema);

export default Wishlist;
