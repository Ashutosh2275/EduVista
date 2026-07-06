import { v2 as cloudinary } from 'cloudinary';
import env from './env';
import logger from '../utils/logger';

/**
 * Configures Cloudinary SDK with credentials from environment.
 * Called once during app initialization.
 */
function configureCloudinary(): void {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    logger.warn(
      '[Cloudinary] Missing Cloudinary credentials. Image uploads will be disabled. ' +
      'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env'
    );
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  logger.info(`[Cloudinary] ✅ Configured for cloud: "${env.CLOUDINARY_CLOUD_NAME}"`);
}

export { cloudinary, configureCloudinary };
export default configureCloudinary;
