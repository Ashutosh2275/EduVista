import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import collegeRoutes from './college.routes';
import courseRoutes from './course.routes';
import searchRoutes from './search.routes';
import compareRoutes from './compare.routes';
import wishlistRoutes from './wishlist.routes';
import enquiryRoutes from './enquiry.routes';
import adminRoutes from './admin.routes';
import { verifyToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Mount all API version 1 sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/colleges', collegeRoutes);
router.use('/courses', courseRoutes);
router.use('/search', searchRoutes);
router.use('/compare', compareRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/admin', verifyToken, requireAdmin, adminRoutes);

export default router;
