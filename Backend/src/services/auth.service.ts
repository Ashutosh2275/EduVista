import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { EmailService } from './email.service';
import { RegisterData, LoginCredentials, TokenPair, JwtPayload } from '../types';
import {
  hashPassword,
  comparePassword,
  ApiError,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashIncomingResetToken,
  logger,
} from '../utils';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import env from '../config/env';

export class AuthService {
  private userRepository: UserRepository;
  private tokenRepository: RefreshTokenRepository;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenRepository = new RefreshTokenRepository();
    this.emailService = new EmailService();
  }

  /**
   * Registers a new user.
   */
  async register(data: RegisterData): Promise<void> {
    // 1. Check for duplicate email
    const emailExists = await this.userRepository.existsEmail(data.email);
    if (emailExists) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.EMAIL_EXISTS,
        'An account with this email address already exists.'
      );
    }

    // 2. Check for duplicate phone
    const phoneExists = await this.userRepository.existsPhone(data.phone);
    if (phoneExists) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.INVALID_PHONE,
        'An account with this phone number already exists.'
      );
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(data.password);

    // 4. Save user
    await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  /**
   * Log in user and generate access/refresh tokens.
   */
  async login(
    credentials: LoginCredentials,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ user: any; tokens: TokenPair }> {
    // 1. Fetch user including password hash
    const user = await this.userRepository.findByEmail(credentials.email, true);
    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid email or password.'
      );
    }

    // 2. Check account status
    if (!user.isActive) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACCOUNT_DISABLED,
        'Your account has been deactivated. Please contact support.'
      );
    }

    // 3. Compare passwords
    const isPasswordValid = await comparePassword(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid email or password.'
      );
    }

    // 4. Generate token payload
    const payload: JwtPayload = {
      id: user._id.toHexString(),
      role: user.role,
      email: user.email,
    };

    // 5. Generate tokens
    const accessToken = generateAccessToken(payload);
    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = getRefreshTokenExpiry(credentials.rememberMe);

    // 6. Save refresh token in database
    await this.tokenRepository.create(
      user._id.toHexString(),
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress
    );

    // 7. Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        field: user.field,
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  /**
   * Refreshes access and rotates refresh token.
   */
  async refreshTokens(
    rawRefreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<TokenPair> {
    const tokenHash = hashRefreshToken(rawRefreshToken);

    // 1. Look up refresh token in database
    const tokenDoc = await this.tokenRepository.findByHash(tokenHash);
    if (!tokenDoc) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.SESSION_EXPIRED,
        'Session expired or invalid refresh token.'
      );
    }

    // 2. Check if expired
    if (tokenDoc.expiresAt.getTime() < Date.now()) {
      await this.tokenRepository.deleteByHash(tokenHash);
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.SESSION_EXPIRED,
        'Session expired. Please sign in again.'
      );
    }

    // 3. Get user details
    const user = await this.userRepository.findById(tokenDoc.userId.toHexString());
    if (!user || !user.isActive) {
      await this.tokenRepository.deleteByHash(tokenHash);
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.USER_NOT_FOUND,
        'User account is invalid or deactivated.'
      );
    }

    // 4. Generate new tokens (Rotate tokens to prevent replay attacks)
    const payload: JwtPayload = {
      id: user._id.toHexString(),
      role: user.role,
      email: user.email,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRawRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);

    // 5. Delete old refresh token, save new refresh token
    await this.tokenRepository.deleteByHash(tokenHash);
    await this.tokenRepository.create(
      user._id.toHexString(),
      newTokenHash,
      tokenDoc.expiresAt, // Keep original expiration for session safety
      userAgent,
      ipAddress
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Revoke/logout a specific refresh token.
   */
  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    await this.tokenRepository.deleteByHash(tokenHash);
  }

  /**
   * Fetch current authenticated user.
   */
  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        'User profile not found.'
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      field: user.field,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Initiate password reset — generate token, persist hash, send email.
   */
  async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    logger.info(`[Auth] Password reset requested for: ${normalizedEmail}`);

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      logger.warn(`[Auth] Password reset rejected — no account found: ${normalizedEmail}`);
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        'No account found with this email address.'
      );
    }

    if (!user.isActive) {
      logger.warn(`[Auth] Password reset rejected — account disabled: ${normalizedEmail}`);
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACCOUNT_DISABLED,
        'Your account has been deactivated. Please contact support.'
      );
    }

    const { rawToken, hashedToken } = generatePasswordResetToken();
    const expiresAt = getPasswordResetExpiry();
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    await this.userRepository.savePasswordReset(user._id.toHexString(), hashedToken, expiresAt);
    logger.info(
      `[Auth] Reset token stored for user ${user._id.toHexString()}, expires ${expiresAt.toISOString()}`
    );

    if (!this.emailService.isSmtpConfigured()) {
      if (env.NODE_ENV === 'development') {
        logger.info(`[Auth] DEV ONLY — Password reset URL: ${resetUrl}`);
        return;
      }
      logger.error('[Auth] SMTP not configured — cannot send password reset email', {
        missing: this.emailService.getSmtpStatus().missing,
      });
      throw new ApiError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SMTP_NOT_CONFIGURED,
        'Email service is not configured. Password reset emails cannot be sent. ' +
          'Set SMTP_USER and SMTP_PASS in the backend .env file.'
      );
    }

    await this.emailService.sendPasswordResetEmail(user.email, user.name, rawToken);
    logger.info(`[Auth] Password reset email sent to: ${normalizedEmail}`);
  }

  /**
   * Complete password reset using a valid token.
   */
  async resetPassword(token: string, password: string): Promise<void> {
    const hashedToken = hashIncomingResetToken(token.trim());
    logger.info('[Auth] Password reset attempt with token');

    const user = await this.userRepository.findByPasswordResetToken(hashedToken);
    if (!user) {
      logger.warn('[Auth] Password reset failed — invalid or expired token');
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_RESET_TOKEN,
        'This password reset link is invalid or has expired. Please request a new one.'
      );
    }

    if (!user.isActive) {
      logger.warn(`[Auth] Password reset rejected — account disabled: ${user.email}`);
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACCOUNT_DISABLED,
        'Your account has been deactivated. Please contact support.'
      );
    }

    const hashedPassword = await hashPassword(password);
    await this.userRepository.updatePassword(user._id.toHexString(), hashedPassword);
    await this.userRepository.clearPasswordReset(user._id.toHexString());

    const revoked = await this.tokenRepository.deleteAllForUser(user._id.toHexString());
    logger.info(
      `[Auth] Password reset successful for ${user.email}. Revoked ${revoked} refresh token(s).`
    );
  }
}

export default AuthService;
