import { FilterQuery, SortOrder } from 'mongoose';
import { CollegeRepository } from '../repositories/college.repository';
import { ICollegeDocument, ICollege } from '../models';
import { CollegeFilterOptions } from '../types';
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

export class CollegeService {
  private collegeRepository: CollegeRepository;

  constructor() {
    this.collegeRepository = new CollegeRepository();
  }

  /**
   * Public: Query colleges with filters, sorting, and pagination.
   * Only returns 'published' colleges.
   */
  async getColleges(options: CollegeFilterOptions): Promise<{
    colleges: ICollegeDocument[];
    pagination: any;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // 1. Build Query Filter
    const filters: FilterQuery<ICollegeDocument>[] = [{ status: 'published' }];

    if (options.q) {
      // Fuzzy search regex on name / city
      const regex = buildRegexFilter(options.q);
      if (regex) {
        filters.push({
          $or: [
            { name: regex },
            { shortDescription: regex },
            { 'location.city': regex },
            { 'location.state': regex },
          ],
        });
      }
    }

    if (options.city) {
      filters.push({ 'location.city': buildRegexFilter(options.city) });
    }

    if (options.state) {
      filters.push({ 'location.state': buildRegexFilter(options.state) });
    }

    if (options.type) {
      filters.push({ collegeType: options.type });
    }

    if (options.category) {
      filters.push({ category: options.category });
    }

    if (options.categories?.length) {
      filters.push({ category: { $in: options.categories } });
    }

    if (options.isFeatured !== undefined) {
      filters.push({ isFeatured: options.isFeatured });
    }

    // Min rating filter
    if (options.minRating !== undefined && !isNaN(options.minRating)) {
      filters.push({ rating: { $gte: options.minRating } });
    }

    // Starting fees range filter
    if (options.minFees !== undefined || options.maxFees !== undefined) {
      filters.push(buildRangeFilter('fees.startingFees', options.minFees, options.maxFees));
    }

    const finalFilter = mergeFilters(...filters);

    // 2. Parse Sort Key
    const sort = parseSortQuery(options.sort, { rating: -1 }) as Record<string, SortOrder>;

    // 3. Fetch data and count
    const colleges = await this.collegeRepository.find(finalFilter, sort, skip, limit);
    const total = await this.collegeRepository.count(finalFilter);
    const pagination = buildPaginationMeta(total, page, limit);

    return { colleges, pagination };
  }

  /**
   * Public: Retrieve details of a published college by slug.
   */
  async getCollegeBySlug(slug: string): Promise<ICollegeDocument> {
    const college = await this.collegeRepository.findBySlug(slug);
    if (!college || college.status !== 'published') {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COLLEGE_NOT_FOUND,
        'College not found or is in draft mode.'
      );
    }
    return college;
  }

  /**
   * Public: Get featured colleges.
   */
  async getFeaturedColleges(limit = 6): Promise<ICollegeDocument[]> {
    return this.collegeRepository.find(
      { status: 'published', isFeatured: true },
      { rating: -1 },
      0,
      limit
    );
  }

  /**
   * Public: Get trending colleges.
   */
  async getTrendingColleges(limit = 6): Promise<ICollegeDocument[]> {
    return this.collegeRepository.find(
      { status: 'published', isTrending: true },
      { 'placements.averagePackage': -1 },
      0,
      limit
    );
  }

  /**
   * Public: Get recommended colleges.
   * Simple placeholder matching ownership type or ratings.
   */
  async getRecommendedColleges(userId?: string, limit = 4): Promise<ICollegeDocument[]> {
    // Standard default recommendations: highest packages / rankings
    return this.collegeRepository.find(
      { status: 'published' },
      { nirfRanking: 1, rating: -1 },
      0,
      limit
    );
  }

  // ────────────────────────────────────────────────────────────
  // Admin Operations
  // ────────────────────────────────────────────────────────────

  /**
   * Admin: List all colleges including draft/archived.
   */
  async adminGetColleges(
    options: CollegeFilterOptions & { status?: string }
  ): Promise<{ colleges: ICollegeDocument[]; pagination: any }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const filters: FilterQuery<ICollegeDocument>[] = [];

    if (options.status) {
      filters.push({ status: options.status });
    }

    if (options.q) {
      const regex = buildRegexFilter(options.q);
      if (regex) {
        filters.push({
          $or: [{ name: regex }, { 'location.city': regex }, { 'location.state': regex }],
        });
      }
    }

    const finalFilter = mergeFilters(...filters);
    const sort = parseSortQuery(options.sort, { createdAt: -1 }) as Record<string, SortOrder>;

    const colleges = await this.collegeRepository.find(finalFilter, sort, skip, limit);
    const total = await this.collegeRepository.count(finalFilter);
    const pagination = buildPaginationMeta(total, page, limit);

    return { colleges, pagination };
  }

  /**
   * Admin: Add a new college.
   */
  async createCollege(data: Partial<ICollege>): Promise<ICollegeDocument> {
    if (!data.name) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, 'College name is required.');
    }

    // Check duplicate name
    const exists = await this.collegeRepository.existsName(data.name);
    if (exists) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.SLUG_EXISTS,
        'A college with this name already exists.'
      );
    }

    // Auto-generate unique slug
    const baseSlug = slugify(data.name);
    const existing = await this.collegeRepository.existsSlug(baseSlug);
    data.slug = existing ? uniqueSlug(baseSlug, [baseSlug]) : baseSlug;

    if (!data.category) {
      data.category = 'engineering';
    }

    const payload: Partial<ICollege> = {
      ...data,
      collegeType: data.collegeType ?? 'public',
      ownership: data.ownership ?? 'Government',
      category: data.category ?? 'engineering',
      status: data.status ?? 'published',
      location: {
        city: data.location?.city ?? '',
        state: data.location?.state ?? '',
        country: data.location?.country ?? 'India',
        address: data.location?.address,
        latitude: data.location?.latitude,
        longitude: data.location?.longitude,
      },
      shortDescription:
        data.shortDescription ??
        data.description ??
        `${data.name} offers quality education and industry-ready programs.`,
      description: data.description ?? data.shortDescription ?? '',
    };

    return this.collegeRepository.create(payload);
  }

  /**
   * Admin: Get college by ObjectID.
   */
  async getCollegeById(id: string): Promise<ICollegeDocument> {
    const college = await this.collegeRepository.findById(id);
    if (!college) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COLLEGE_NOT_FOUND,
        'College record not found.'
      );
    }
    return college;
  }

  /**
   * Admin: Update college parameters.
   */
  async updateCollege(id: string, data: Partial<ICollege>): Promise<ICollegeDocument> {
    const college = await this.collegeRepository.findById(id);
    if (!college) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COLLEGE_NOT_FOUND,
        'College record not found.'
      );
    }

    // If name is updated, check duplicate and rebuild slug
    if (data.name && data.name !== college.name) {
      const exists = await this.collegeRepository.existsName(data.name);
      if (exists) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.SLUG_EXISTS,
          'A college with this name already exists.'
        );
      }
      const baseSlug = slugify(data.name);
      const existing = await this.collegeRepository.existsSlug(baseSlug);
      data.slug = existing ? uniqueSlug(baseSlug, [baseSlug]) : baseSlug;
    }

    const updated = await this.collegeRepository.update(id, data);
    if (!updated) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to update college details.'
      );
    }
    return updated;
  }

  /**
   * Admin: Soft-archive a college.
   */
  async archiveCollege(id: string): Promise<ICollegeDocument> {
    return this.updateCollege(id, { status: 'archived' });
  }

  /**
   * Admin: Publish a college (make active publicly).
   */
  async publishCollege(id: string): Promise<ICollegeDocument> {
    return this.updateCollege(id, { status: 'published' });
  }

  /**
   * Admin: Delete college completely.
   */
  async deleteCollege(id: string): Promise<void> {
    const deleted = await this.collegeRepository.delete(id);
    if (!deleted) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COLLEGE_NOT_FOUND,
        'College not found or already deleted.'
      );
    }
  }
}

export default CollegeService;
