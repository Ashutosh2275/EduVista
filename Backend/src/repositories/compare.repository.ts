import mongoose from 'mongoose';
import { CompareSelection, ICompareSelectionDocument } from '../models';

export class CompareRepository {
  /**
   * Find a user's comparison selection.
   */
  async findByUserId(userId: string): Promise<ICompareSelectionDocument | null> {
    return CompareSelection.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
  }

  /**
   * Save / overwrite comparison selection.
   * If document doesn't exist, it upserts a new one.
   */
  async saveCompareSelection(
    userId: string,
    collegeIds: string[]
  ): Promise<ICompareSelectionDocument | null> {
    const objectIds = collegeIds.map((id) => new mongoose.Types.ObjectId(id));
    return CompareSelection.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: { colleges: objectIds } },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  /**
   * Clear comparison list.
   */
  async clear(userId: string): Promise<ICompareSelectionDocument | null> {
    return CompareSelection.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: { colleges: [] } },
      { new: true }
    ).exec();
  }
}

export default CompareRepository;
