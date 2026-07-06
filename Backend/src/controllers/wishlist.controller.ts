import { Request, Response } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { ApiResponse, ApiError } from '../utils';

export class WishlistController {
  private wishlistService: WishlistService;

  constructor() {
    this.wishlistService = new WishlistService();
  }

  /**
   * GET /api/v1/wishlist
   */
  getWishlist = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw ApiError.unauthorized();
    const wishlist = await this.wishlistService.getWishlist(req.user.id);
    return ApiResponse.success(res, wishlist, 'Wishlist retrieved successfully.');
  };

  /**
   * POST /api/v1/wishlist
   */
  addCollege = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw ApiError.unauthorized();
    const { collegeId } = req.body;

    if (!collegeId) {
      throw ApiError.badRequest('collegeId is required in request body.');
    }

    await this.wishlistService.addCollege(req.user.id, collegeId);
    return ApiResponse.success(res, null, 'College added to wishlist.');
  };

  /**
   * DELETE /api/v1/wishlist/:collegeId
   */
  removeCollege = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw ApiError.unauthorized();
    const { collegeId } = req.params;

    await this.wishlistService.removeCollege(req.user.id, collegeId as string);
    return ApiResponse.success(res, null, 'College removed from wishlist.');
  };

  /**
   * DELETE /api/v1/wishlist
   */
  clearWishlist = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw ApiError.unauthorized();
    await this.wishlistService.clearWishlist(req.user.id);
    return ApiResponse.success(res, null, 'Wishlist cleared successfully.');
  };

  /**
   * GET /api/v1/wishlist/check/:collegeId
   */
  checkExists = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw ApiError.unauthorized();
    const { collegeId } = req.params;

    const exists = await this.wishlistService.checkExists(req.user.id, collegeId as string);
    return ApiResponse.success(res, { exists }, 'Wishlist item checked.');
  };
}

export default WishlistController;
