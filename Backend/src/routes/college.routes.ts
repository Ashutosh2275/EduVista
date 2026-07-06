import { Router } from 'express';
import { CollegeController } from '../controllers/college.controller';
import { verifyTokenOptional } from '../middleware';

const router = Router();
const collegeController = new CollegeController();

/**
 * @route   GET /api/v1/colleges
 * @desc    Get paginated, filtered, sorted list of colleges
 * @access  Public
 */
router.get('/', collegeController.getColleges);

/**
 * @route   GET /api/v1/colleges/featured
 * @desc    Get highly rated colleges flagged as featured
 * @access  Public
 */
router.get('/featured', collegeController.getFeaturedColleges);

/**
 * @route   GET /api/v1/colleges/trending
 * @desc    Get colleges with highest placement records
 * @access  Public
 */
router.get('/trending', collegeController.getTrendingColleges);

/**
 * @route   GET /api/v1/colleges/recommended
 * @desc    Get recommended colleges matching profile
 * @access  Private (Optional)
 */
router.get('/recommended', verifyTokenOptional, collegeController.getRecommendedColleges);

/**
 * @route   GET /api/v1/colleges/:slug
 * @desc    Get single college profile details by SEO slug
 * @access  Public
 */
router.get('/:slug', collegeController.getCollegeBySlug);

export default router;
