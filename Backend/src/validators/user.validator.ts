import { body } from 'express-validator';
import { isStrongPassword } from '../utils/passwordUtils';

/**
 * Profile update validator rules.
 */
export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number starting with 6-9.'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters.'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters.'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters.'),

  body('dateOfBirth')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Please provide a valid Date of Birth (ISO 8601 format, e.g. YYYY-MM-DD).'),

  body('field')
    .optional()
    .trim()
    .isIn([
      'engineering', 'medical', 'business', 'arts',
      'science', 'law', 'design', 'commerce', 'other', '',
    ])
    .withMessage('Invalid field of interest selected.'),
];

/**
 * Password change validator rules.
 */
export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required.')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password cannot be the same as current password.');
      }
      if (!isStrongPassword(value)) {
        throw new Error(
          'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        );
      }
      return true;
    }),
];
