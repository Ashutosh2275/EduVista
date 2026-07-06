import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import env from '../config/env';

// ────────────────────────────────────────────────────────────
// Allowed MIME Types
// ────────────────────────────────────────────────────────────

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// ────────────────────────────────────────────────────────────
// Storage — use disk storage (temp before Cloudinary upload)
// ────────────────────────────────────────────────────────────

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ────────────────────────────────────────────────────────────
// File Filter
// ────────────────────────────────────────────────────────────

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_FILE_TYPE,
        `Invalid file type: "${file.mimetype}". Allowed types: ${ALLOWED_TYPES.join(', ')}.`
      )
    );
  }
};

// ────────────────────────────────────────────────────────────
// Multer Instance
// ────────────────────────────────────────────────────────────

export const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,   // Convert MB to bytes
    files: 5,                                         // Max 5 files per request
  },
});

// ────────────────────────────────────────────────────────────
// Convenience exports
// ────────────────────────────────────────────────────────────

/** Single image upload (field: 'image') */
export const uploadSingle = upload.single('image');

/** Multiple images (field: 'images', max 5) */
export const uploadMultiple = upload.array('images', 5);

/** Specific named fields */
export const uploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);
