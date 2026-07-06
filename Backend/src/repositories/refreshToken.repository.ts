import mongoose from 'mongoose';
import { RefreshToken, IRefreshTokenDocument } from '../models';

/**
 * RefreshTokenRepository
 *
 * Implements the Repository Pattern for Refresh Tokens.
 * Manages storage, checking, rotation, and revocation of refresh tokens in DB.
 */
export class RefreshTokenRepository {
  /**
   * Save a new refresh token to the database.
   */
  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string
  ): Promise<IRefreshTokenDocument> {
    const token = new RefreshToken({
      userId: new mongoose.Types.ObjectId(userId),
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    });
    return token.save();
  }

  /**
   * Find a refresh token by its hashed value.
   * Note: tokenHash has select: false, so we must explicitly query and verify.
   */
  async findByHash(tokenHash: string): Promise<IRefreshTokenDocument | null> {
    // Overriding select to load tokenHash since it's hidden by default in the schema
    return RefreshToken.findOne({ tokenHash }).select('+tokenHash').exec();
  }

  /**
   * Delete/revoke a specific refresh token from DB.
   */
  async deleteByHash(tokenHash: string): Promise<boolean> {
    const result = await RefreshToken.deleteOne({ tokenHash });
    return result.deletedCount > 0;
  }

  /**
   * Revoke all refresh tokens for a user (e.g. force logout from all devices).
   */
  async deleteAllForUser(userId: string): Promise<number> {
    const result = await RefreshToken.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    return result.deletedCount;
  }
}

export default RefreshTokenRepository;
