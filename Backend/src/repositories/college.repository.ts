import { FilterQuery, SortOrder } from 'mongoose';
import { College, ICollegeDocument } from '../models';

export class CollegeRepository {
  /**
   * Finds colleges matching a filter, sorted and paginated.
   */
  async find(
    filter: FilterQuery<ICollegeDocument>,
    sort: Record<string, SortOrder>,
    skip: number,
    limit: number
  ): Promise<ICollegeDocument[]> {
    return College.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Counts the total number of documents matching a filter.
   */
  async count(filter: FilterQuery<ICollegeDocument>): Promise<number> {
    return College.countDocuments(filter).exec();
  }

  /**
   * Find a college by ID.
   */
  async findById(id: string): Promise<ICollegeDocument | null> {
    return College.findById(id).exec();
  }

  /**
   * Find a college by slug.
   */
  async findBySlug(slug: string): Promise<ICollegeDocument | null> {
    return College.findOne({ slug: slug.toLowerCase().trim() }).exec();
  }

  /**
   * Create a new college document.
   */
  async create(data: Partial<ICollegeDocument>): Promise<ICollegeDocument> {
    const college = new College(data);
    return college.save();
  }

  /**
   * Update an existing college document by ID.
   */
  async update(id: string, updateData: Partial<ICollegeDocument>): Promise<ICollegeDocument | null> {
    return College.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  /**
   * Hard delete a college document by ID.
   */
  async delete(id: string): Promise<boolean> {
    const result = await College.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Check if a college with the specified name exists.
   */
  async existsName(name: string): Promise<boolean> {
    const count = await College.countDocuments({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    return count > 0;
  }

  /**
   * Check if a college with the specified slug exists.
   */
  async existsSlug(slug: string): Promise<boolean> {
    const count = await College.countDocuments({ slug: slug.toLowerCase().trim() });
    return count > 0;
  }
}

export default CollegeRepository;
