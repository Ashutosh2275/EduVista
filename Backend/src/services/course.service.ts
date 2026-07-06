import { FilterQuery, SortOrder } from 'mongoose';
import { CourseRepository } from '../repositories/course.repository';
import { ICourseDocument, ICourse } from '../models';
import { CourseFilterOptions } from '../types';
import {
  ApiError,
  slugify,
  uniqueSlug,
  buildPaginationMeta,
  buildRegexFilter,
  buildRangeFilter,
  mergeFilters,
  parseSortQuery,
} from '../utils';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  /**
   * Public: Query courses with filters, sorting, and pagination.
   * Only returns 'published' courses.
   */
  async getCourses(options: CourseFilterOptions): Promise<{
    courses: ICourseDocument[];
    pagination: any;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // 1. Build Query Filter
    const filters: FilterQuery<ICourseDocument>[] = [{ status: 'published' }];

    if (options.q) {
      const regex = buildRegexFilter(options.q);
      if (regex) {
        filters.push({
          $or: [
            { name: regex },
            { shortDescription: regex },
            { specialization: regex },
          ],
        });
      }
    }

    if (options.stream) {
      filters.push({ stream: options.stream });
    }

    if (options.level) {
      filters.push({ degreeLevel: options.level });
    }

    if (options.mode) {
      filters.push({ mode: options.mode });
    }

    if (options.duration) {
      filters.push({ duration: buildRegexFilter(options.duration) });
    }

    if (options.isFeatured !== undefined) {
      filters.push({ isFeatured: options.isFeatured });
    }

    if (options.isTrending !== undefined) {
      filters.push({ isTrending: options.isTrending });
    }

    // Min rating filter
    if (options.rating !== undefined && !isNaN(options.rating)) {
      filters.push({ rating: { $gte: options.rating } });
    }

    // Tuition fees range filter
    if (options.minFees !== undefined || options.maxFees !== undefined) {
      filters.push(buildRangeFilter('fees.tuitionFees', options.minFees, options.maxFees));
    }

    // Entrance exam filter
    if (options.entranceExam) {
      filters.push({ 'academics.entranceExams': buildRegexFilter(options.entranceExam) });
    }

    const finalFilter = mergeFilters(...filters);

    // 2. Parse Sort Key
    const sort = parseSortQuery(options.sort, { rating: -1 }) as Record<string, SortOrder>;

    // 3. Fetch data and count
    const courses = await this.courseRepository.find(finalFilter, sort, skip, limit);
    const total = await this.courseRepository.count(finalFilter);
    const pagination = buildPaginationMeta(total, page, limit);

    return { courses, pagination };
  }

  /**
   * Public: Retrieve details of a published course by slug.
   * Also populates offering colleges details.
   */
  async getCourseBySlug(slug: string): Promise<ICourseDocument> {
    const course = await this.courseRepository.findBySlug(slug);
    if (!course || course.status !== 'published') {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course not found or is in draft mode.'
      );
    }
    // Populate offering colleges details (using simple select to optimize)
    await course.populate({
      path: 'collegesOffering',
      select: 'name slug logo location rating ownership establishedYear banner',
    });
    return course;
  }

  /**
   * Public: Get featured courses.
   */
  async getFeaturedCourses(limit = 6): Promise<ICourseDocument[]> {
    return this.courseRepository.find(
      { status: 'published', isFeatured: true },
      { rating: -1 },
      0,
      limit
    );
  }

  /**
   * Public: Get trending courses.
   */
  async getTrendingCourses(limit = 6): Promise<ICourseDocument[]> {
    return this.courseRepository.find(
      { status: 'published', isTrending: true },
      { 'placement.averagePackage': -1 },
      0,
      limit
    );
  }

  /**
   * Public: Get popular courses based on colleges offering.
   */
  async getPopularCourses(limit = 6): Promise<ICourseDocument[]> {
    return this.courseRepository.find(
      { status: 'published' },
      { numberOfCollegesOffering: -1, rating: -1 },
      0,
      limit
    );
  }

  /**
   * Public: Get recommended courses based on user's field of interest.
   */
  async getRecommendedCourses(field?: string, limit = 4): Promise<ICourseDocument[]> {
    const filters: FilterQuery<ICourseDocument> = { status: 'published' };
    
    // Check if user has selected a stream interest
    if (field && field !== 'other') {
      filters.stream = field.toLowerCase();
    }

    return this.courseRepository.find(filters, { rating: -1, reviewCount: -1 }, 0, limit);
  }

  // ────────────────────────────────────────────────────────────
  // Admin Operations
  // ────────────────────────────────────────────────────────────

  /**
   * Admin: List all courses.
   */
  async adminGetCourses(
    options: CourseFilterOptions & { status?: string }
  ): Promise<{ courses: ICourseDocument[]; pagination: any }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const filters: FilterQuery<ICourseDocument>[] = [];

    if (options.status) {
      filters.push({ status: options.status });
    }

    if (options.q) {
      const regex = buildRegexFilter(options.q);
      if (regex) {
        filters.push({
          $or: [{ name: regex }, { specialization: regex }],
        });
      }
    }

    const finalFilter = mergeFilters(...filters);
    const sort = parseSortQuery(options.sort, { createdAt: -1 }) as Record<string, SortOrder>;

    const courses = await this.courseRepository.find(finalFilter, sort, skip, limit);
    const total = await this.courseRepository.count(finalFilter);
    const pagination = buildPaginationMeta(total, page, limit);

    return { courses, pagination };
  }

  /**
   * Admin: Add a new course.
   */
  async createCourse(data: Partial<ICourse>): Promise<ICourseDocument> {
    if (!data.name) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, 'Course name is required.');
    }

    // Check duplicate name
    const exists = await this.courseRepository.existsName(data.name);
    if (exists) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.SLUG_EXISTS,
        'A course with this name already exists.'
      );
    }

    // Auto-generate unique slug
    const baseSlug = slugify(data.name);
    const existing = await this.courseRepository.existsSlug(baseSlug);
    data.slug = existing ? uniqueSlug(baseSlug, [baseSlug]) : baseSlug;

    const payload: Partial<ICourse> = {
      degreeLevel: 'UG',
      stream: 'engineering',
      duration: '4 years',
      mode: 'full-time',
      status: 'published',
      ...data,
    };

    return this.courseRepository.create(payload);
  }

  /**
   * Admin: Get course by ObjectID.
   */
  async getCourseById(id: string): Promise<ICourseDocument> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course record not found.'
      );
    }
    return course;
  }

  /**
   * Admin: Update course parameters.
   */
  async updateCourse(id: string, data: Partial<ICourse>): Promise<ICourseDocument> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course record not found.'
      );
    }

    // If name is updated, check duplicate and rebuild slug
    if (data.name && data.name !== course.name) {
      const exists = await this.courseRepository.existsName(data.name);
      if (exists) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.SLUG_EXISTS,
          'A course with this name already exists.'
        );
      }
      const baseSlug = slugify(data.name);
      const existing = await this.courseRepository.existsSlug(baseSlug);
      data.slug = existing ? uniqueSlug(baseSlug, [baseSlug]) : baseSlug;
    }

    const updated = await this.courseRepository.update(id, data);
    if (!updated) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to update course details.'
      );
    }
    return updated;
  }

  /**
   * Admin: Soft-archive a course.
   */
  async archiveCourse(id: string): Promise<ICourseDocument> {
    return this.updateCourse(id, { status: 'archived' });
  }

  /**
   * Admin: Publish a course.
   */
  async publishCourse(id: string): Promise<ICourseDocument> {
    return this.updateCourse(id, { status: 'published' });
  }

  /**
   * Admin: Delete course completely.
   */
  async deleteCourse(id: string): Promise<void> {
    const deleted = await this.courseRepository.delete(id);
    if (!deleted) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course not found or already deleted.'
      );
    }
  }
}

export default CourseService;
