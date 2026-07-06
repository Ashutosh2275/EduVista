import fs from 'fs/promises';
import path from 'path';
import { RefreshToken } from '../models';
import logger from '../utils/logger';

export class CronService {
  private tokenCleanupInterval?: NodeJS.Timeout;
  private uploadCleanupInterval?: NodeJS.Timeout;

  /**
   * Starts all scheduled background jobs.
   */
  start(): void {
    logger.info('🚀 Initializing scheduled background jobs scheduler...');

    // Run Refresh Tokens cleanup every 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;
    this.tokenCleanupInterval = setInterval(async () => {
      await this.cleanupExpiredTokens();
    }, twentyFourHours);

    // Run temporary upload cleanups every 12 hours
    const twelveHours = 12 * 60 * 60 * 1000;
    this.uploadCleanupInterval = setInterval(async () => {
      await this.cleanupTempUploads();
    }, twelveHours);

    // Execute immediately on startup (non-blocking)
    Promise.resolve().then(async () => {
      await this.cleanupExpiredTokens();
      await this.cleanupTempUploads();
    });
  }

  /**
   * Stop background intervals.
   * Ensures graceful shutdown.
   */
  stop(): void {
    if (this.tokenCleanupInterval) clearInterval(this.tokenCleanupInterval);
    if (this.uploadCleanupInterval) clearInterval(this.uploadCleanupInterval);
    logger.info('[Scheduler] Background jobs stopped.');
  }

  /**
   * Delete expired refresh tokens from database.
   */
  private async cleanupExpiredTokens(): Promise<void> {
    try {
      logger.info('[Scheduler] Starting expired refresh tokens database cleanup...');
      const result = await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } }).exec();
      logger.info(`[Scheduler] Expired refresh tokens cleaned. Revoked count: ${result.deletedCount}`);
    } catch (error) {
      const err = error as Error;
      logger.error(`[Scheduler] Expired tokens cleanup failed: ${err.message}`);
    }
  }

  /**
   * Deletes files in /uploads folder older than 24 hours.
   */
  private async cleanupTempUploads(): Promise<void> {
    try {
      logger.info('[Scheduler] Starting temporary uploads directory cleanup...');
      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      const files = await fs.readdir(uploadsDir);

      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      let count = 0;

      for (const file of files) {
        if (file === '.gitkeep') continue;

        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > twentyFourHours) {
          await fs.unlink(filePath);
          count++;
        }
      }

      logger.info(`[Scheduler] Temporary uploads directory cleaned. Removed: ${count} file(s).`);
    } catch (error) {
      const err = error as Error;
      logger.error(`[Scheduler] Temp uploads cleanup failed: ${err.message}`);
    }
  }
}

export default CronService;
