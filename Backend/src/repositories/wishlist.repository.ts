import mongoose from 'mongoose';
import { Wishlist, IWishlistDocument } from '../models';

export class WishlistRepository {
  /**
   * Find a user's wishlist and populate college details.
   */
  async findByUserId(userId: string): Promise<IWishlistDocument | null> {
    return Wishlist.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
  }

  /**
   * Initialize a new wishlist for a user.
   */
  async create(userId: string): Promise<IWishlistDocument> {
    const wishlist = new Wishlist({
      userId: new mongoose.Types.ObjectId(userId),
      colleges: [],
    });
    return wishlist.save();
  }

  /**
   * Add a college ID to the wishlist.
   * Uses $addToSet to avoid duplicates at database level.
   */
  async addCollege(userId: string, collegeId: string): Promise<IWishlistDocument | null> {
    return Wishlist.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $addToSet: { colleges: new mongoose.Types.ObjectId(collegeId) } },
      { new: true, upsert: true }
    ).exec();
  }

  /**
   * Remove a college ID from the wishlist.
   */
  async removeCollege(userId: string, collegeId: string): Promise<IWishlistDocument | null> {
    return Wishlist.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $pull: { colleges: new mongoose.Types.ObjectId(collegeId) } },
      { new: true }
    ).exec();
  }

  /**
   * Clear all colleges from a wishlist.
   */
  async clear(userId: string): Promise<IWishlistDocument | null> {
    return Wishlist.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: { colleges: [] } },
      { new: true }
    ).exec();
  }

  /**
   * Check if a college ID exists in the user's wishlist array.
   */
  async checkExists(userId: string, collegeId: string): Promise<boolean> {
    const count = await Wishlist.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      colleges: new mongoose.Types.ObjectId(collegeId),
    });
    return count > 0;
  }
}

export default WishlistRepository;
