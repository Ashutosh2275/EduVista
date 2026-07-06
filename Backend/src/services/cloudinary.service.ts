import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import logger from '../utils/logger';
import ApiError from '../utils/ApiError';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

export class CloudinaryService {
  /**
   * Uploads a local file to Cloudinary.
   * Automatically deletes the local file from disk after uploading (even on failure).
   *
   * @param localFilePath - Path to the file on local disk
   * @param folderName - Cloudinary folder (e.g. 'avatars', 'colleges')
   */
  async uploadImage(localFilePath: string, folderName: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: `eduvista/${folderName}`,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
      });

      // Cleanup local file asynchronously
      await fs.unlink(localFilePath).catch((err) => {
        logger.error(`[Cloudinary] Failed to delete temp file: ${localFilePath}`, err);
      });

      return result.secure_url;
    } catch (error) {
      // Ensure file is deleted from local disk even on upload failure
      await fs.unlink(localFilePath).catch(() => {});

      logger.error('[Cloudinary] Upload failed:', error);
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.UPLOAD_FAILED,
        'Failed to upload image to cloud storage.'
      );
    }
  }

  /**
   * Deletes an image from Cloudinary using its secure URL or public ID.
   */
  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    try {
      // Extract public_id from secure URL
      // Format: https://res.cloudinary.com/<cloud>/image/upload/v<version>/<folder>/<name>.<ext>
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1];
      const nameWithoutExtension = filename.split('.')[0];
      const folderParts = parts.slice(parts.indexOf('image/upload') + 2, parts.length - 1);
      
      // If version tag (v123456) is in folderParts, strip it
      const filteredFolderParts = folderParts.filter((p) => !p.startsWith('v'));
      const publicId = [...filteredFolderParts, nameWithoutExtension].join('/');

      await cloudinary.uploader.destroy(publicId);
      logger.info(`[Cloudinary] Deleted image asset: ${publicId}`);
    } catch (error) {
      logger.error(`[Cloudinary] Failed to delete asset: ${imageUrl}`, error);
    }
  }
}

export default CloudinaryService;
