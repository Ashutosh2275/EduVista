import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { verifyToken, verifyTokenOptional } from '../middleware';

const router = Router();
const searchController = new SearchController();

/**
 * @route   GET /api/v1/search
 * @desc    Unified advanced search for colleges and courses with filters
 * @access  Public (Optional auth to bind search history)
 */
router.get('/', verifyTokenOptional, searchController.search);

/**
 * @route   GET /api/v1/search/suggestions
 * @desc    Fetch autocomplete hints for matching titles/names
 * @access  Public
 */
router.get('/suggestions', searchController.getSuggestions);

/**
 * @route   GET /api/v1/search/trending
 * @desc    Fetch trending search words across the platform
 * @access  Public
 */
router.get('/trending', searchController.getTrending);

/**
 * @route   GET /api/v1/search/recent
 * @desc    Fetch authenticated user's recent search queries list
 * @access  Private (Authentication required)
 */
router.get('/recent', verifyToken, searchController.getRecent);

/**
 * @route   GET /api/v1/search/recommendations
 * @desc    Fetch personalized search matching stream & locations
 * @access  Public (Optional auth for customized preference matching)
 */
router.get('/recommendations', verifyTokenOptional, searchController.getRecommendations);

export default router;
