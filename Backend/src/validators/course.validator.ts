import { body, param } from 'express-validator';

/**
 * Validates ObjectID parameter format for courses
 */
export const courseIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid course ID format. Expected a standard MongoDB ObjectID.'),
];

/**
 * Course creation validator rules
 */
export const createCourseValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Course name is required.')
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters.'),

  body('degreeLevel')
    .trim()
    .notEmpty()
    .withMessage('Degree level is required.')
    .isIn(['UG', 'PG', 'Diploma', 'PhD'])
    .withMessage('Degree level must be UG, PG, Diploma, or PhD.'),

  body('stream')
    .trim()
    .notEmpty()
    .withMessage('Course stream is required.')
    .isIn(['engineering', 'medical', 'management', 'commerce', 'law', 'design', 'science', 'arts', 'other'])
    .withMessage('Invalid course stream selected.'),

  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Course duration is required.'),

  body('mode')
    .trim()
    .notEmpty()
    .withMessage('Course mode is required.')
    .isIn(['full-time', 'part-time', 'online'])
    .withMessage('Course mode must be full-time, part-time, or online.'),

  body('fees.tuitionFees')
    .optional()
    .isNumeric({ no_symbols: true })
    .withMessage('Tuition fees must be a positive number.'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a decimal between 0.0 and 5.0.'),
];

/**
 * Course update validator rules (allows optional updates)
 */
export const updateCourseValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters.'),

  body('degreeLevel')
    .optional()
    .trim()
    .isIn(['UG', 'PG', 'Diploma', 'PhD'])
    .withMessage('Degree level must be UG, PG, Diploma, or PhD.'),

  body('stream')
    .optional()
    .trim()
    .isIn(['engineering', 'medical', 'management', 'commerce', 'law', 'design', 'science', 'arts', 'other'])
    .withMessage('Invalid course stream selected.'),

  body('duration')
    .optional()
    .trim(),

  body('mode')
    .optional()
    .trim()
    .isIn(['full-time', 'part-time', 'online'])
    .withMessage('Course mode must be full-time, part-time, or online.'),

  body('fees.tuitionFees')
    .optional()
    .isNumeric({ no_symbols: true })
    .withMessage('Tuition fees must be a positive number.'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a decimal between 0.0 and 5.0.'),
];
