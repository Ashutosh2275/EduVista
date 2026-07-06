import { Router } from 'express';
import { EnquiryController } from '../controllers/enquiry.controller';
import { submitEnquiryValidator } from '../validators';
import { validate } from '../middleware';

const router = Router();
const enquiryController = new EnquiryController();

/**
 * @route   POST /api/v1/enquiries
 * @desc    Submit a new student inquiry (Public, unauthenticated)
 * @access  Public
 */
router.post(
  '/',
  submitEnquiryValidator,
  validate,
  enquiryController.submitEnquiry
);

export default router;
