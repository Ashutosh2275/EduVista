import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { verifyToken } from '../middleware';

const router = Router();
const wishlistController = new WishlistController();

// Guard all wishlist routes
router.use(verifyToken);

/**
 * @route   GET /api/v1/wishlist
 * @desc    Get current user's saved colleges wishlist
 * @access  Private
 */
router.get('/', wishlistController.getWishlist);

/**
 * @route   POST /api/v1/wishlist
 * @desc    Add a college to user's saved list
 * @access  Private
 */
router.post('/', wishlistController.addCollege);

/**
 * @route   DELETE /api/v1/wishlist/:collegeId
 * @desc    Remove a specific college from user's saved list
 * @access  Private
 */
router.delete('/:collegeId', wishlistController.removeCollege);

/**
 * @route   DELETE /api/v1/wishlist
 * @desc    Clear all items from user's saved list
 * @access  Private
 */
router.delete('/', wishlistController.clearWishlist);

/**
 * @route   GET /api/v1/wishlist/check/:collegeId
 * @desc    Quickly verify if college is saved by user
 * @access  Private
 */
router.get('/check/:collegeId', wishlistController.checkExists);

export default router;
