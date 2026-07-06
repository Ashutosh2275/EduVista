import { Router } from 'express';
import { CompareController } from '../controllers/compare.controller';
import { verifyToken } from '../middleware';

const router = Router();
const compareController = new CompareController();

// Guard all comparison routes
router.use(verifyToken);

/**
 * @route   GET /api/v1/compare
 * @desc    Get detailed statistics of compared colleges (max 3)
 * @access  Private
 */
router.get('/', compareController.getCompareDetails);

/**
 * @route   POST /api/v1/compare
 * @desc    Save / overwrite comparison selections list (max 3, no duplicates)
 * @access  Private
 */
router.post('/', compareController.saveCompareSelection);

/**
 * @route   DELETE /api/v1/compare
 * @desc    Clear all items in user's comparison selection
 * @access  Private
 */
router.delete('/', compareController.clearCompare);

export default router;
