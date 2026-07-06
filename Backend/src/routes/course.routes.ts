import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { verifyTokenOptional } from '../middleware';

const router = Router();
const courseController = new CourseController();

/**
 * @route   GET /api/v1/courses
 * @desc    Get paginated, filtered, sorted list of courses
 * @access  Public
 */
router.get('/', courseController.getCourses);

/**
 * @route   GET /api/v1/courses/featured
 * @desc    Get highly rated courses flagged as featured
 * @access  Public
 */
router.get('/featured', courseController.getFeaturedCourses);

/**
 * @route   GET /api/v1/courses/trending
 * @desc    Get courses with highest placement record averages
 * @access  Public
 */
router.get('/trending', courseController.getTrendingCourses);

/**
 * @route   GET /api/v1/courses/popular
 * @desc    Get popular courses based on colleges offering count
 * @access  Public
 */
router.get('/popular', courseController.getPopularCourses);

/**
 * @route   GET /api/v1/courses/recommended
 * @desc    Get recommended courses matching user preferences
 * @access  Private (Optional)
 */
router.get('/recommended', verifyTokenOptional, courseController.getRecommendedCourses);

/**
 * @route   GET /api/v1/courses/:slug
 * @desc    Get single course profile details by SEO slug
 * @access  Public
 */
router.get('/:slug', courseController.getCourseBySlug);

export default router;
