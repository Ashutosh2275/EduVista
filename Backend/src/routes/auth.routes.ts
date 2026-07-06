import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators';
import { validate, authenticateUser } from '../middleware';
import { authLimiter } from '../config';
import { asyncHandler } from '../utils';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  registerValidator,
  validate,
  asyncHandler(authController.register)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get tokens
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  asyncHandler(authController.login)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user & invalidate tokens
 * @access  Private (Auth required)
 */
router.post('/logout', asyncHandler(authController.logout));

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token using refresh token (rotation)
 * @access  Public (Uses cookies or body)
 */
router.post('/refresh-token', asyncHandler(authController.refreshToken));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateUser, asyncHandler(authController.getMe));

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request a password reset link
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  validate,
  asyncHandler(authController.forgotPassword)
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token from email
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  resetPasswordValidator,
  validate,
  asyncHandler(authController.resetPassword)
);

export default router;
