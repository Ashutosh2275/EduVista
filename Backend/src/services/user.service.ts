import { UserRepository } from '../repositories/user.repository';
import { WishlistRepository } from '../repositories/wishlist.repository';
import { CompareRepository } from '../repositories/compare.repository';
import { CloudinaryService } from './cloudinary.service';
import { CollegeService } from './college.service';
import { ApiError, hashPassword, comparePassword } from '../utils';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import env from '../config/env';
import { IUserDocument } from '../models';

export interface IProfileUpdateInput {
  name?: string;
  phone?: string;
  bio?: string;
  city?: string;
  state?: string;
  dateOfBirth?: Date;
  field?: string;
}

export class UserService {
  private userRepository: UserRepository;
  private wishlistRepository: WishlistRepository;
  private compareRepository: CompareRepository;
  private cloudinaryService: CloudinaryService;
  private collegeService: CollegeService;

  constructor() {
    this.userRepository = new UserRepository();
    this.wishlistRepository = new WishlistRepository();
    this.compareRepository = new CompareRepository();
    this.cloudinaryService = new CloudinaryService();
    this.collegeService = new CollegeService();
  }

  /**
   * Retrieves a user profile by ID.
   */
  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        'User profile not found.'
      );
    }
    return user;
  }

  /**
   * Updates a user profile.
   */
  async updateProfile(userId: string, input: IProfileUpdateInput): Promise<IUserDocument> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        'User profile not found.'
      );
    }

    // If phone number is being changed, check for duplicate phone across other users
    if (input.phone && input.phone !== user.phone) {
      const phoneExists = await this.userRepository.existsPhone(input.phone);
      if (phoneExists) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.INVALID_PHONE,
          'An account with this phone number already exists.'
        );
      }
    }

    // Apply fields
    if (input.name !== undefined) user.name = input.name;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.bio !== undefined) user.bio = input.bio;
    if (input.city !== undefined) user.city = input.city;
    if (input.state !== undefined) user.state = input.state;
    if (input.dateOfBirth !== undefined) user.dateOfBirth = input.dateOfBirth;
    if (input.field !== undefined) user.field = input.field;

    return user.save();
  }

  /**
   * Changes a user's password.
   */
  async changePassword(
    userId: string,
    currentPlain: string,
    newPlain: string
  ): Promise<void> {
    // 1. Fetch user including password
    const user = await this.userRepository.findByEmail(
      (await this.getProfile(userId)).email,
      true
    );
    if (!user) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        'User profile not found.'
      );
    }

    // 2. Validate current password
    const isValid = await comparePassword(currentPlain, user.password);
    if (!isValid) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CURRENT_PASSWORD,
        'The current password you entered is incorrect.'
      );
    }

    // 3. Hash and save new password
    user.password = await hashPassword(newPlain);
    await user.save();
  }

  /**
   * Uploads avatar and deletes old one if present.
   */
  async uploadAvatar(userId: string, localFilePath: string): Promise<string> {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new ApiError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.UPLOAD_FAILED,
        'Profile image uploads are not available. Cloudinary is not configured on the server.'
      );
    }

    const user = await this.getProfile(userId);

    // Upload new image to Cloudinary
    const secureUrl = await this.cloudinaryService.uploadImage(localFilePath, 'avatars');

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar) {
      await this.cloudinaryService.deleteImage(user.avatar);
    }

    // Save URL to user record
    user.avatar = secureUrl;
    await user.save();

    return secureUrl;
  }

  /**
   * Performs a soft delete on a user account.
   */
  async softDeleteAccount(userId: string): Promise<void> {
    const user = await this.getProfile(userId);
    user.isActive = false;
    await user.save();
  }

  /**
   * Compiles dashboard details for a user.
   */
  async getDashboardData(userId: string): Promise<any> {
    const user = await this.getProfile(userId);

    const [wishlist, compare, recommendedColleges] = await Promise.all([
      this.wishlistRepository.findByUserId(userId),
      this.compareRepository.findByUserId(userId),
      this.collegeService.getRecommendedColleges(userId, 4),
    ]);

    const wishlistCount = wishlist?.colleges?.length ?? 0;
    const compareCount = compare?.colleges?.length ?? 0;
    const savedCollegesCount = wishlistCount;

    const recentActivity = user.recentSearches.map((s) => ({
      type: 'search',
      description: `Searched for "${s.query}"`,
      timestamp: s.timestamp,
    }));

    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        city: user.city,
        state: user.state,
        field: user.field,
      },
      stats: {
        savedCollegesCount,
        compareCount,
        wishlistCount,
      },
      recentActivity: recentActivity.slice(0, 5),
      recommendedColleges,
    };
  }
}

export default UserService;
