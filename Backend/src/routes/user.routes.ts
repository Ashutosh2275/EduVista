import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { updateProfileValidator, changePasswordValidator } from '../validators';
import { validate, authenticateUser, uploadSingle } from '../middleware';

const router = Router();
const userController = new UserController();

// Apply authentication guard to all user routes
router.use(authenticateUser);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile details
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update profile info (name, phone, bio, city, state, dob, field)
 * @access  Private
 */
router.put(
  '/profile',
  updateProfileValidator,
  validate,
  userController.updateProfile
);

/**
 * @route   PATCH /api/v1/users/change-password
 * @desc    Verify current password and set new password
 * @access  Private
 */
router.patch(
  '/change-password',
  changePasswordValidator,
  validate,
  userController.changePassword
);

/**
 * @route   POST /api/v1/users/upload-avatar
 * @desc    Upload profile image to Cloudinary & update database URL
 * @access  Private
 */
router.post(
  '/upload-avatar',
  uploadSingle,
  userController.uploadAvatar
);

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Deactivate current user account (soft delete)
 * @access  Private
 */
router.delete('/account', userController.deleteAccount);

/**
 * @route   GET /api/v1/users/dashboard
 * @desc    Fetch aggregated user dashboard datasets and recent searches
 * @access  Private
 */
router.get('/dashboard', userController.getDashboardData);

export default router;
