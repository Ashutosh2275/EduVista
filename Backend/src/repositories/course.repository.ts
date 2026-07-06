import { FilterQuery, SortOrder } from 'mongoose';
import { Course, ICourseDocument } from '../models';

export class CourseRepository {
  /**
   * Finds courses matching a filter, sorted and paginated.
   */
  async find(
    filter: FilterQuery<ICourseDocument>,
    sort: Record<string, SortOrder>,
    skip: number,
    limit: number
  ): Promise<ICourseDocument[]> {
    return Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Counts the total number of documents matching a filter.
   */
  async count(filter: FilterQuery<ICourseDocument>): Promise<number> {
    return Course.countDocuments(filter).exec();
  }

  /**
   * Find a course by ID.
   */
  async findById(id: string): Promise<ICourseDocument | null> {
    return Course.findById(id).exec();
  }

  /**
   * Find a course by slug.
   */
  async findBySlug(slug: string): Promise<ICourseDocument | null> {
    return Course.findOne({ slug: slug.toLowerCase().trim() }).exec();
  }

  /**
   * Create a new course document.
   */
  async create(data: Partial<ICourseDocument>): Promise<ICourseDocument> {
    const course = new Course(data);
    return course.save();
  }

  /**
   * Update an existing course document by ID.
   */
  async update(id: string, updateData: Partial<ICourseDocument>): Promise<ICourseDocument | null> {
    return Course.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  /**
   * Hard delete a course document by ID.
   */
  async delete(id: string): Promise<boolean> {
    const result = await Course.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Check if a course with the specified name exists.
   */
  async existsName(name: string): Promise<boolean> {
    const count = await Course.countDocuments({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    return count > 0;
  }

  /**
   * Check if a course with the specified slug exists.
   */
  async existsSlug(slug: string): Promise<boolean> {
    const count = await Course.countDocuments({ slug: slug.toLowerCase().trim() });
    return count > 0;
  }

  /**
   * Add a college ID to the collegesOffering list.
   */
  async addCollegeToCourse(courseId: string, collegeId: string): Promise<void> {
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { collegesOffering: collegeId },
      $inc: { numberOfCollegesOffering: 1 },
    });
  }

  /**
   * Remove a college ID from the collegesOffering list.
   */
  async removeCollegeFromCourse(courseId: string, collegeId: string): Promise<void> {
    await Course.findByIdAndUpdate(courseId, {
      $pull: { collegesOffering: collegeId },
      $inc: { numberOfCollegesOffering: -1 },
    });
  }
}

export default CourseRepository;
