import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import { ApiResponse, parsePagination } from '../utils';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  /**
   * GET /api/v1/courses
   */
  getCourses = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = parsePagination(req, 12);
    const { q, stream, level, mode, duration, minFees, maxFees, rating, entranceExam, sort } = req.query;

    const parsedMinFees = minFees ? parseInt(minFees as string, 10) : undefined;
    const parsedMaxFees = maxFees ? parseInt(maxFees as string, 10) : undefined;
    const parsedRating = rating ? parseFloat(rating as string) : undefined;

    const { courses, pagination } = await this.courseService.getCourses({
      q: q as string,
      stream: stream as any,
      level: level as any,
      mode: mode as any,
      duration: duration as string,
      minFees: parsedMinFees,
      maxFees: parsedMaxFees,
      rating: parsedRating,
      entranceExam: entranceExam as string,
      sort: sort as string,
      page,
      limit,
    });

    return ApiResponse.paginated(res, courses, pagination, 'Courses retrieved successfully.');
  };

  /**
   * GET /api/v1/courses/:slug
   */
  getCourseBySlug = async (req: Request, res: Response): Promise<Response> => {
    const { slug } = req.params;
    const course = await this.courseService.getCourseBySlug(slug as string);
    return ApiResponse.success(res, course, 'Course details retrieved successfully.');
  };

  /**
   * GET /api/v1/courses/featured
   */
  getFeaturedCourses = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const courses = await this.courseService.getFeaturedCourses(limit);
    return ApiResponse.success(res, courses, 'Featured courses retrieved.');
  };

  /**
   * GET /api/v1/courses/trending
   */
  getTrendingCourses = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const courses = await this.courseService.getTrendingCourses(limit);
    return ApiResponse.success(res, courses, 'Trending courses retrieved.');
  };

  /**
   * GET /api/v1/courses/popular
   */
  getPopularCourses = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const courses = await this.courseService.getPopularCourses(limit);
    return ApiResponse.success(res, courses, 'Popular courses retrieved.');
  };

  /**
   * GET /api/v1/courses/recommended
   */
  getRecommendedCourses = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;
    // req.user?.field represents their preference stream if logged in
    const courses = await this.courseService.getRecommendedCourses(req.user?.email, limit);
    return ApiResponse.success(res, courses, 'Recommended courses retrieved.');
  };

  // ────────────────────────────────────────────────────────────
  // Admin Operations
  // ────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/admin/courses
   */
  adminGetCourses = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = parsePagination(req);
    const { q, status, sort } = req.query;

    const { courses, pagination } = await this.courseService.adminGetCourses({
      q: q as string,
      status: status as string,
      sort: sort as string,
      page,
      limit,
    });

    return ApiResponse.paginated(res, courses, pagination, 'Admin courses list retrieved.');
  };

  /**
   * GET /api/v1/admin/courses/:id
   */
  adminGetCourseById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const course = await this.courseService.getCourseById(id as string);
    return ApiResponse.success(res, course, 'Course details retrieved successfully.');
  };

  /**
   * POST /api/v1/admin/courses
   */
  adminCreateCourse = async (req: Request, res: Response): Promise<Response> => {
    const course = await this.courseService.createCourse(req.body);
    return ApiResponse.created(res, course, 'Course profile created successfully.');
  };

  /**
   * PUT /api/v1/admin/courses/:id
   */
  adminUpdateCourse = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const course = await this.courseService.updateCourse(id as string, req.body);
    return ApiResponse.success(res, course, 'Course profile updated successfully.');
  };

  /**
   * DELETE /api/v1/admin/courses/:id
   */
  adminDeleteCourse = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.courseService.deleteCourse(id as string);
    return ApiResponse.success(res, null, 'Course document deleted permanently.');
  };

  /**
   * PATCH /api/v1/admin/courses/:id/publish
   */
  adminPublishCourse = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const course = await this.courseService.publishCourse(id as string);
    return ApiResponse.success(res, course, 'Course profile published publicly.');
  };

  /**
   * PATCH /api/v1/admin/courses/:id/archive
   */
  adminArchiveCourse = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const course = await this.courseService.archiveCourse(id as string);
    return ApiResponse.success(res, course, 'Course profile archived.');
  };
}

export default CourseController;
