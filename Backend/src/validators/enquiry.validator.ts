import { body, param } from 'express-validator';

function normalizeIndianPhone(value: string): string {
  const cleaned = value.replace(/[\s\-()]/g, '');
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) return cleaned.slice(3);
  if (/^91[6-9]\d{9}$/.test(cleaned)) return cleaned.slice(2);
  return cleaned;
}

/**
 * Validates ObjectID parameter format for enquiries
 */
export const enquiryIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid enquiry ID format. Expected a standard MongoDB ObjectID.'),
];

/**
 * Enquiry submission validator rules
 */
export const submitEnquiryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Student name is required.')
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
    .customSanitizer(normalizeIndianPhone)
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number (e.g. 9876543210, +91 9876543210).'),

  body('interestedCourse')
    .trim()
    .notEmpty()
    .withMessage('Interested course name is required.'),

  body('college')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid college reference format. Expected a standard MongoDB ObjectID.'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message details are required.')
    .isLength({ max: 1000 })
    .withMessage('Message text cannot exceed 1000 characters.'),
];
