import { FilterQuery, SortOrder } from 'mongoose';
import { College, Course, User, ICollegeDocument, ICourseDocument } from '../models';

export class SearchRepository {
  /**
   * Search colleges with a text query, filters, sorting, and pagination.
   */
  async searchColleges(
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
   * Count total colleges matching a filter.
   */
  async countColleges(filter: FilterQuery<ICollegeDocument>): Promise<number> {
    return College.countDocuments(filter).exec();
  }

  /**
   * Search courses with a text query, filters, sorting, and pagination.
   */
  async searchCourses(
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
   * Count total courses matching a filter.
   */
  async countCourses(filter: FilterQuery<ICourseDocument>): Promise<number> {
    return Course.countDocuments(filter).exec();
  }

  /**
   * Auto-complete suggestions matching a query prefix.
   * Searches college and course names.
   */
  async getAutocompleteSuggestions(query: string, limit = 5): Promise<any> {
    const regex = new RegExp(`^${query.trim()}`, 'i');

    const [colleges, courses] = await Promise.all([
      College.find({ name: regex, status: 'published' })
        .select('name slug logo location.city location.state rating')
        .limit(limit)
        .lean()
        .exec(),
      Course.find({ name: regex, status: 'published' })
        .select('name slug stream degreeLevel duration mode rating')
        .limit(limit)
        .lean()
        .exec(),
    ]);

    return { colleges, courses };
  }

  /**
   * Appends a search query to a user's search history list.
   * Caps the list at 10 items.
   */
  async saveUserSearch(userId: string, queryText: string): Promise<void> {
    const cleanQuery = queryText.trim().slice(0, 100);
    if (!cleanQuery) return;

    await User.findByIdAndUpdate(userId, {
      $pull: { recentSearches: { query: cleanQuery } }, // Remove duplicate if it exists
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        recentSearches: {
          $each: [{ query: cleanQuery, timestamp: new Date() }],
          $position: 0, // Put at the top
          $slice: 10,   // Cap at 10 items
        },
      },
    });
  }

  /**
   * Fetches the top trending search queries of the platform.
   * Simple aggregation listing recent user searches.
   */
  async getTrendingSearches(limit = 6): Promise<string[]> {
    const results = await User.aggregate([
      { $unwind: '$recentSearches' },
      {
        $group: {
          _id: { $toLower: '$recentSearches.query' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return results.map((r) => r._id);
  }
}

export default SearchRepository;
