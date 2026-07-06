import { FilterQuery, SortOrder } from 'mongoose';
import { SearchRepository } from '../repositories/search.repository';
import { UserRepository } from '../repositories/user.repository';
import { ICollegeDocument, ICourseDocument } from '../models';
import {
  buildRegexFilter,
  buildRangeFilter,
  mergeFilters,
  parseSortQuery,
  buildPaginationMeta,
} from '../utils';

export class SearchService {
  private searchRepository: SearchRepository;
  private userRepository: UserRepository;

  constructor() {
    this.searchRepository = new SearchRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Unified Advanced Search.
   * Can search across Colleges, Courses, or both.
   */
  async search(
    queryText: string,
    type: 'college' | 'course' | 'all' = 'all',
    filters: any = {},
    sortKey?: string,
    page = 1,
    limit = 10,
    userId?: string
  ): Promise<any> {
    const skip = (page - 1) * limit;

    // Save search history if user is authenticated
    if (userId && queryText && queryText.trim()) {
      await this.searchRepository.saveUserSearch(userId, queryText);
    }

    let colleges: ICollegeDocument[] = [];
    let courses: ICourseDocument[] = [];
    let totalColleges = 0;
    let totalCourses = 0;

    // ────────────────────────────────────────────────────────────
    // 1. Search Colleges
    // ────────────────────────────────────────────────────────────
    if (type === 'college' || type === 'all') {
      const collegeFilters: FilterQuery<ICollegeDocument>[] = [{ status: 'published' }];

      if (queryText) {
        const regex = buildRegexFilter(queryText);
        if (regex) {
          collegeFilters.push({
            $or: [
              { name: regex },
              { shortDescription: regex },
              { 'location.city': regex },
              { 'location.state': regex },
            ],
          });
        }
      }

      if (filters.city) collegeFilters.push({ 'location.city': buildRegexFilter(filters.city) });
      if (filters.state) collegeFilters.push({ 'location.state': buildRegexFilter(filters.state) });
      if (filters.collegeType) collegeFilters.push({ collegeType: filters.collegeType });
      if (filters.ownership) collegeFilters.push({ ownership: buildRegexFilter(filters.ownership) });
      if (filters.naacGrade) collegeFilters.push({ naacGrade: filters.naacGrade });

      if (filters.feesMin !== undefined || filters.feesMax !== undefined) {
        collegeFilters.push(buildRangeFilter('fees.startingFees', filters.feesMin, filters.feesMax));
      }

      if (filters.rating !== undefined) {
        collegeFilters.push({ rating: { $gte: filters.rating } });
      }

      const finalCollegeFilter = mergeFilters(...collegeFilters);
      const sort = parseSortQuery(sortKey, { rating: -1 }) as Record<string, SortOrder>;

      colleges = await this.searchRepository.searchColleges(finalCollegeFilter, sort, skip, limit);
      totalColleges = await this.searchRepository.countColleges(finalCollegeFilter);
    }

    // ────────────────────────────────────────────────────────────
    // 2. Search Courses
    // ────────────────────────────────────────────────────────────
    if (type === 'course' || type === 'all') {
      const courseFilters: FilterQuery<ICourseDocument>[] = [{ status: 'published' }];

      if (queryText) {
        const regex = buildRegexFilter(queryText);
        if (regex) {
          courseFilters.push({
            $or: [
              { name: regex },
              { shortDescription: regex },
              { specialization: regex },
            ],
          });
        }
      }

      if (filters.stream) courseFilters.push({ stream: filters.stream });
      if (filters.degree) courseFilters.push({ degreeLevel: filters.degree });
      if (filters.mode) courseFilters.push({ mode: filters.mode });
      if (filters.duration) courseFilters.push({ duration: buildRegexFilter(filters.duration) });

      if (filters.feesMin !== undefined || filters.feesMax !== undefined) {
        courseFilters.push(buildRangeFilter('fees.tuitionFees', filters.feesMin, filters.feesMax));
      }

      if (filters.rating !== undefined) {
        courseFilters.push({ rating: { $gte: filters.rating } });
      }

      const finalCourseFilter = mergeFilters(...courseFilters);
      const sort = parseSortQuery(sortKey, { rating: -1 }) as Record<string, SortOrder>;

      courses = await this.searchRepository.searchCourses(finalCourseFilter, sort, skip, limit);
      totalCourses = await this.searchRepository.countCourses(finalCourseFilter);
    }

    const totalResults = totalColleges + totalCourses;
    const pagination = buildPaginationMeta(
      type === 'all' ? Math.max(totalColleges, totalCourses) : totalResults,
      page,
      limit
    );

    return {
      type,
      colleges,
      courses,
      pagination,
    };
  }

  /**
   * Get autocompletion options.
   */
  async getSuggestions(query: string, limit = 5): Promise<any> {
    if (!query || !query.trim()) {
      return { colleges: [], courses: [] };
    }
    return this.searchRepository.getAutocompleteSuggestions(query, limit);
  }

  /**
   * Get trending platform searches.
   */
  async getTrending(): Promise<string[]> {
    return this.searchRepository.getTrendingSearches();
  }

  /**
   * Get authenticated user's recent searches.
   */
  async getRecent(userId: string): Promise<string[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) return [];
    return user.recentSearches.map((s) => s.query);
  }

  /**
   * Recommendation Engine.
   * Compiles custom results matching user location and stream interests.
   * Fallback to highest-rated popular entities if no preferences configured.
   */
  async getRecommendations(userId?: string, limit = 5): Promise<any> {
    let interestedStreams: string[] = [];
    let preferredLocations: string[] = [];

    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (user) {
        interestedStreams = user.preferences.interestedFields || [];
        preferredLocations = user.preferences.preferredLocations || [];
      }
    }

    // 1. Recommend Colleges
    const collegeFilters: FilterQuery<ICollegeDocument>[] = [{ status: 'published' }];
    if (preferredLocations.length > 0) {
      collegeFilters.push({
        $or: [
          { 'location.city': { $in: preferredLocations } },
          { 'location.state': { $in: preferredLocations } },
        ],
      });
    }
    const finalCollegeFilter = mergeFilters(...collegeFilters);

    // 2. Recommend Courses
    const courseFilters: FilterQuery<ICourseDocument>[] = [{ status: 'published' }];
    if (interestedStreams.length > 0) {
      courseFilters.push({ stream: { $in: interestedStreams } });
    }
    const finalCourseFilter = mergeFilters(...courseFilters);

    // Fetch recommendations sorted by rating
    const [recommendedColleges, recommendedCourses] = await Promise.all([
      this.searchRepository.searchColleges(finalCollegeFilter, { rating: -1 }, 0, limit),
      this.searchRepository.searchCourses(finalCourseFilter, { rating: -1 }, 0, limit),
    ]);

    return {
      colleges: recommendedColleges,
      courses: recommendedCourses,
    };
  }
}

export default SearchService;
