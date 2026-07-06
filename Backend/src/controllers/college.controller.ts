import { Request, Response } from 'express';
import { CollegeService } from '../services/college.service';
import { ApiResponse, parsePagination } from '../utils';

export class CollegeController {
  private collegeService: CollegeService;

  constructor() {
    this.collegeService = new CollegeService();
  }

  /**
   * GET /api/v1/colleges
   */
  getColleges = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = parsePagination(req, 12);
    const { q, type, city, state, category, minFees, maxFees, minRating, sort } = req.query;

    const parsedMinFees = minFees ? parseInt(minFees as string, 10) : undefined;
    const parsedMaxFees = maxFees ? parseInt(maxFees as string, 10) : undefined;
    const parsedMinRating = minRating ? parseFloat(minRating as string) : undefined;

    const { colleges, pagination } = await this.collegeService.getColleges({
      q: q as string,
      type: type as any,
      city: city as string,
      state: state as string,
      category: category as string,
      minFees: parsedMinFees,
      maxFees: parsedMaxFees,
      minRating: parsedMinRating,
      sort: sort as string,
      page,
      limit,
    });

    return ApiResponse.paginated(res, colleges, pagination, 'Colleges retrieved successfully.');
  };

  /**
   * GET /api/v1/colleges/:slug
   */
  getCollegeBySlug = async (req: Request, res: Response): Promise<Response> => {
    const { slug } = req.params;
    const college = await this.collegeService.getCollegeBySlug(slug as string);
    return ApiResponse.success(res, college, 'College details retrieved successfully.');
  };

  /**
   * GET /api/v1/colleges/featured
   */
  getFeaturedColleges = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const colleges = await this.collegeService.getFeaturedColleges(limit);
    return ApiResponse.success(res, colleges, 'Featured colleges retrieved.');
  };

  /**
   * GET /api/v1/colleges/trending
   */
  getTrendingColleges = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const colleges = await this.collegeService.getTrendingColleges(limit);
    return ApiResponse.success(res, colleges, 'Trending colleges retrieved.');
  };

  /**
   * GET /api/v1/colleges/recommended
   */
  getRecommendedColleges = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;
    const colleges = await this.collegeService.getRecommendedColleges(req.user?.id, limit);
    return ApiResponse.success(res, colleges, 'Recommended colleges retrieved.');
  };

  // ────────────────────────────────────────────────────────────
  // Admin Operations
  // ────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/admin/colleges
   */
  adminGetColleges = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = parsePagination(req);
    const { q, status, sort } = req.query;

    const { colleges, pagination } = await this.collegeService.adminGetColleges({
      q: q as string,
      status: status as string,
      sort: sort as string,
      page,
      limit,
    });

    return ApiResponse.paginated(res, colleges, pagination, 'Admin colleges list retrieved.');
  };

  /**
   * GET /api/v1/admin/colleges/:id
   */
  adminGetCollegeById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const college = await this.collegeService.getCollegeById(id as string);
    return ApiResponse.success(res, college, 'College details retrieved successfully.');
  };

  /**
   * POST /api/v1/admin/colleges
   */
  adminCreateCollege = async (req: Request, res: Response): Promise<Response> => {
    const college = await this.collegeService.createCollege(req.body);
    return ApiResponse.created(res, college, 'College profile created successfully.');
  };

  /**
   * PUT /api/v1/admin/colleges/:id
   */
  adminUpdateCollege = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const college = await this.collegeService.updateCollege(id as string, req.body);
    return ApiResponse.success(res, college, 'College profile updated successfully.');
  };

  /**
   * DELETE /api/v1/admin/colleges/:id
   */
  adminDeleteCollege = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.collegeService.deleteCollege(id as string);
    return ApiResponse.success(res, null, 'College document deleted permanently.');
  };

  /**
   * PATCH /api/v1/admin/colleges/:id/publish
   */
  adminPublishCollege = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const college = await this.collegeService.publishCollege(id as string);
    return ApiResponse.success(res, college, 'College profile published publicly.');
  };

  /**
   * PATCH /api/v1/admin/colleges/:id/archive
   */
  adminArchiveCollege = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const college = await this.collegeService.archiveCollege(id as string);
    return ApiResponse.success(res, college, 'College profile archived.');
  };
}

export default CollegeController;
