import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse, ApiError } from '../utils';
import { HTTP_STATUS, MESSAGES } from '../constants';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Retrieves profile of current logged in user.
   */
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const user = await this.userService.getProfile(req.user.id);
    return ApiResponse.success(res, user, MESSAGES.PROFILE_FETCHED);
  };

  /**
   * Updates profile fields of current user.
   */
  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { name, phone, bio, city, state, dateOfBirth, field } = req.body;
    
    // Parse DOB if provided
    let dobParsed: Date | undefined;
    if (dateOfBirth) {
      dobParsed = new Date(dateOfBirth);
      if (isNaN(dobParsed.getTime())) {
        throw ApiError.badRequest('Invalid date of birth format.');
      }
    }

    const updatedUser = await this.userService.updateProfile(req.user.id, {
      name,
      phone,
      bio,
      city,
      state,
      dateOfBirth: dobParsed,
      field,
    });

    return ApiResponse.success(res, updatedUser, MESSAGES.PROFILE_UPDATED);
  };

  /**
   * Modifies current user password.
   */
  changePassword = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { currentPassword, newPassword } = req.body;
    await this.userService.changePassword(req.user.id, currentPassword, newPassword);

    return ApiResponse.success(res, null, MESSAGES.PASSWORD_CHANGED);
  };

  /**
   * Uploads user avatar.
   */
  uploadAvatar = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    if (!req.file) {
      throw ApiError.badRequest('No image file uploaded.');
    }

    const secureUrl = await this.userService.uploadAvatar(req.user.id, req.file.path);

    return ApiResponse.success(res, { avatar: secureUrl }, MESSAGES.UPLOAD_SUCCESS);
  };

  /**
   * Deactivates/soft deletes user account.
   */
  deleteAccount = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    await this.userService.softDeleteAccount(req.user.id);

    return ApiResponse.success(res, null, MESSAGES.ACCOUNT_DELETED);
  };

  /**
   * Compiles dashboard datasets.
   */
  getDashboardData = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const dashboard = await this.userService.getDashboardData(req.user.id);

    return ApiResponse.success(res, dashboard, MESSAGES.FETCHED);
  };
}

export default UserController;
