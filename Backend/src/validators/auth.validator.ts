import { body } from 'express-validator';
import { isStrongPassword } from '../utils/passwordUtils';

/**
 * Register validation rules.
 */
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number starting with 6-9.'),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .custom((value) => {
      if (!isStrongPassword(value)) {
        throw new Error(
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        );
      }
      return true;
    }),

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
 * Login validation rules.
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.'),

  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('rememberMe must be a boolean value.'),
];

/**
 * Forgot password validation rules.
 */
export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
];

/**
 * Reset password validation rules.
 */
export const resetPasswordValidator = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required.')
    .isLength({ min: 32 })
    .withMessage('Invalid reset token.'),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .custom((value) => {
      if (!isStrongPassword(value)) {
        throw new Error(
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        );
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];
