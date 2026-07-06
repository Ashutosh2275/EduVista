import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils';
import { HTTP_STATUS, MESSAGES } from '../constants';
import env from '../config/env';

// Cookie options helper — cross-origin SPA (Netlify + Render) needs SameSite=None in production
const getCookieOptions = (rememberMe = false) => {
  const days = rememberMe ? env.JWT_REFRESH_EXPIRE_REMEMBER_DAYS : env.JWT_REFRESH_EXPIRE_DAYS;
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
    maxAge: days * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth', // Scoped only to auth endpoints for security
  };
};

const getClearCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
    path: '/api/v1/auth',
  };
};

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handle user registration.
   */
  register = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, phone, password, field } = req.body;

    await this.authService.register({ name, email, phone, password, field });

    return ApiResponse.created(res, null, MESSAGES.REGISTER_SUCCESS);
  };

  /**
   * Handle user login.
   */
  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, rememberMe } = req.body;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip;

    const { user, tokens } = await this.authService.login(
      { email, password, rememberMe },
      userAgent,
      ipAddress
    );

    // Set Refresh Token as HTTP-Only Cookie
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(rememberMe));

    return ApiResponse.success(
      res,
      {
        accessToken: tokens.accessToken,
        user,
      },
      MESSAGES.LOGIN_SUCCESS
    );
  };

  /**
   * Handle access token refresh and token rotation.
   */
  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    // Read token from cookie (fallback to body/headers for testing)
    const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!rawRefreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Refresh token cookie is missing.',
        },
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip;

    const tokens = await this.authService.refreshTokens(
      rawRefreshToken,
      userAgent,
      ipAddress
    );

    // Set new rotated Refresh Token cookie
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());

    return ApiResponse.success(
      res,
      { accessToken: tokens.accessToken },
      MESSAGES.TOKEN_REFRESHED
    );
  };

  /**
   * Handle user logout and clear credentials cookie.
   */
  logout = async (req: Request, res: Response): Promise<Response> => {
    const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (rawRefreshToken) {
      await this.authService.logout(rawRefreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', getClearCookieOptions());

    return ApiResponse.success(res, null, MESSAGES.LOGOUT_SUCCESS);
  };

  /**
   * Handle fetch current profile.
   */
  getMe = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const user = await this.authService.getCurrentUser(req.user.id);

    return ApiResponse.success(res, { user }, MESSAGES.PROFILE_FETCHED);
  };

  /**
   * Handle forgot password — send reset link email.
   */
  forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;
    await this.authService.forgotPassword(email);
    return ApiResponse.success(res, null, MESSAGES.FORGOT_PASSWORD_EMAIL_SENT);
  };

  /**
   * Handle password reset with token.
   */
  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { token, password } = req.body;
    await this.authService.resetPassword(token, password);
    return ApiResponse.success(res, null, MESSAGES.PASSWORD_RESET_SUCCESS);
  };
}

export default AuthController;
