import { WishlistRepository } from '../repositories/wishlist.repository';
import { CollegeRepository } from '../repositories/college.repository';
import { IWishlistDocument } from '../models';
import { ApiError } from '../utils';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

export class WishlistService {
  private wishlistRepository: WishlistRepository;
  private collegeRepository: CollegeRepository;

  constructor() {
    this.wishlistRepository = new WishlistRepository();
    this.collegeRepository = new CollegeRepository();
  }

  /**
   * Fetch authenticated user's wishlist.
   * Filters out any college that is not 'published' or has been deleted.
   */
  async getWishlist(userId: string): Promise<any[]> {
    const wishlist = await this.wishlistRepository.findByUserId(userId);
    if (!wishlist) return [];

    // Populate college details
    await wishlist.populate({
      path: 'colleges',
      select: 'name slug logo location rating reviewCount fees placements ownership establishedYear banner accreditation naacGrade nirfRanking status',
    });

    // Filter out unpublished / archived colleges for frontend consistency
    const activeColleges = wishlist.colleges.filter(
      (c: any) => c && c.status === 'published'
    );

    return activeColleges;
  }

  /**
   * Add a college to the user's wishlist.
   */
  async addCollege(userId: string, collegeId: string): Promise<void> {
    // 1. Verify college exists and is published
    const college = await this.collegeRepository.findById(collegeId);
    if (!college || college.status !== 'published') {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COLLEGE_NOT_FOUND,
        'College not found or is not active.'
      );
    }

    // 2. Add to wishlist (repository prevents duplicates automatically)
    await this.wishlistRepository.addCollege(userId, collegeId);
  }

  /**
   * Remove a college from user's wishlist.
   */
  async removeCollege(userId: string, collegeId: string): Promise<void> {
    await this.wishlistRepository.removeCollege(userId, collegeId);
  }

  /**
   * Clear all colleges from user's wishlist.
   */
  async clearWishlist(userId: string): Promise<void> {
    await this.wishlistRepository.clear(userId);
  }

  /**
   * Check if college exists in user's wishlist.
   */
  async checkExists(userId: string, collegeId: string): Promise<boolean> {
    return this.wishlistRepository.checkExists(userId, collegeId);
  }
}

export default WishlistService;
