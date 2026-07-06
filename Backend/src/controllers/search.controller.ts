import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { ApiResponse, parsePagination } from '../utils';

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  /**
   * GET /api/v1/search
   * Unified Advanced Search with page, limit, sort, filters, and query text.
   */
  search = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = parsePagination(req, 10);
    const { q, type, sort, city, state, collegeType, ownership, naacGrade, stream, degree, mode, duration, feesMin, feesMax, rating } = req.query;

    const parsedFeesMin = feesMin ? parseInt(feesMin as string, 10) : undefined;
    const parsedFeesMax = feesMax ? parseInt(feesMax as string, 10) : undefined;
    const parsedRating = rating ? parseFloat(rating as string) : undefined;

    const searchType = (type as 'college' | 'course' | 'all') || 'all';

    const results = await this.searchService.search(
      (q as string) || '',
      searchType,
      {
        city: city as string,
        state: state as string,
        collegeType: collegeType as string,
        ownership: ownership as string,
        naacGrade: naacGrade as string,
        stream: stream as string,
        degree: degree as string,
        mode: mode as string,
        duration: duration as string,
        feesMin: parsedFeesMin,
        maxFees: parsedFeesMax, // Map feesMax to maxFees expected in search filters
        rating: parsedRating,
      },
      sort as string,
      page,
      limit,
      req.user?.id
    );

    return ApiResponse.success(res, results, 'Search results compiled successfully.');
  };

  /**
   * GET /api/v1/search/suggestions
   * Autocomplete prefix queries.
   */
  getSuggestions = async (req: Request, res: Response): Promise<Response> => {
    const { q, limit } = req.query;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 5;

    const suggestions = await this.searchService.getSuggestions((q as string) || '', parsedLimit);

    return ApiResponse.success(res, suggestions, 'Autocomplete suggestions fetched.');
  };

  /**
   * GET /api/v1/search/trending
   * Trending search terms across the platform.
   */
  getTrending = async (req: Request, res: Response): Promise<Response> => {
    const trending = await this.searchService.getTrending();
    return ApiResponse.success(res, trending, 'Trending searches retrieved.');
  };

  /**
   * GET /api/v1/search/recent
   * Authenticated user recent searches.
   */
  getRecent = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      return ApiResponse.success(res, [], 'Guest user has no search history.');
    }
    const recent = await this.searchService.getRecent(req.user.id);
    return ApiResponse.success(res, recent, 'User search history retrieved.');
  };

  /**
   * GET /api/v1/search/recommendations
   * Custom personalized recommendations list.
   */
  getRecommendations = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const recommendations = await this.searchService.getRecommendations(req.user?.id, limit);
    return ApiResponse.success(res, recommendations, 'Recommendations list compiled.');
  };
}

export default SearchController;
