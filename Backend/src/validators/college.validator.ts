import { body, param } from 'express-validator';

/**
 * Validates ObjectID parameter format
 */
export const collegeIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid college ID format. Expected a standard MongoDB ObjectID.'),
];

/**
 * College creation validator rules
 */
export const createCollegeValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('College name is required.')
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters.'),

  body('collegeType')
    .trim()
    .notEmpty()
    .withMessage('College type is required.')
    .isIn(['public', 'private', 'government'])
    .withMessage('College type must be public, private, or government.'),

  body('ownership')
    .trim()
    .notEmpty()
    .withMessage('Ownership type is required.'),

  body('category')
    .optional()
    .trim()
    .isIn(['engineering', 'medical', 'management', 'law', 'design', 'science', 'arts'])
    .withMessage('Category must be a valid college category.'),

  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('Location city is required.'),

  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('Location state is required.'),

  body('establishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Please provide a valid established year.'),

  body('fees.startingFees')
    .optional()
    .isNumeric({ no_symbols: true })
    .withMessage('Starting fees must be a positive number.'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a decimal between 0.0 and 5.0.'),
];

/**
 * College update validator rules (allows optional updates)
 */
export const updateCollegeValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters.'),

  body('collegeType')
    .optional()
    .trim()
    .isIn(['public', 'private', 'government'])
    .withMessage('College type must be public, private, or government.'),

  body('ownership')
    .optional()
    .trim(),

  body('location.city')
    .optional()
    .trim(),

  body('location.state')
    .optional()
    .trim(),

  body('establishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Please provide a valid established year.'),

  body('fees.startingFees')
    .optional()
    .isNumeric({ no_symbols: true })
    .withMessage('Starting fees must be a positive number.'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a decimal between 0.0 and 5.0.'),
];
