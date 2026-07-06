import { Router } from 'express';
import { CollegeController } from '../controllers/college.controller';
import { CourseController } from '../controllers/course.controller';
import { EnquiryController } from '../controllers/enquiry.controller';
import { AdminController } from '../controllers/admin.controller';
import {
  createCollegeValidator,
  updateCollegeValidator,
  collegeIdParamValidator,
  createCourseValidator,
  updateCourseValidator,
  courseIdParamValidator,
  enquiryIdParamValidator,
} from '../validators';
import { validate } from '../middleware';

const router = Router();
const collegeController = new CollegeController();
const courseController = new CourseController();
const enquiryController = new EnquiryController();
const adminController = new AdminController();

// Note: admin.routes.ts is already guarded by verifyToken and requireAdmin in routes/index.ts.
// We explicitly keep this file mapped cleanly to admin features.

// ────────────────────────────────────────────────────────────
// Admin Dashboard & Analytics
// ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get dashboard metrics, signup aggregates, and recent listings
 * @access  Private/Admin
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get top categories, density by city, and popular resources
 * @access  Private/Admin
 */
router.get('/analytics', adminController.getAnalytics);

// ────────────────────────────────────────────────────────────
// Admin User Management
// ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get paginated admin view of registered user accounts
 * @access  Private/Admin
 */
router.get('/users', adminController.getUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get detailed user specs
 * @access  Private/Admin
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Modify user parameters (e.g. role, name, phone)
 * @access  Private/Admin
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Deactivate/soft delete user profile
 * @access  Private/Admin
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @desc    Toggle user active state
 * @access  Private/Admin
 */
router.patch('/users/:id/status', adminController.changeUserStatus);

// ────────────────────────────────────────────────────────────
// Admin College CRUD Operations
// ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/colleges
 * @desc    Get paginated admin view of colleges (draft, published, archived)
 * @access  Private/Admin
 */
router.get('/colleges', collegeController.adminGetColleges);

/**
 * @route   GET /api/v1/admin/colleges/:id
 * @desc    Get college details by ObjectID
 * @access  Private/Admin
 */
router.get(
  '/colleges/:id',
  collegeIdParamValidator,
  validate,
  collegeController.adminGetCollegeById
);

/**
 * @route   POST /api/v1/admin/colleges
 * @desc    Create a new college profile
 * @access  Private/Admin
 */
router.post(
  '/colleges',
  createCollegeValidator,
  validate,
  collegeController.adminCreateCollege
);

/**
 * @route   PUT /api/v1/admin/colleges/:id
 * @desc    Update college parameters by ObjectID
 * @access  Private/Admin
 */
router.put(
  '/colleges/:id',
  collegeIdParamValidator,
  updateCollegeValidator,
  validate,
  collegeController.adminUpdateCollege
);

/**
 * @route   DELETE /api/v1/admin/colleges/:id
 * @desc    Delete college document permanently
 * @access  Private/Admin
 */
router.delete(
  '/colleges/:id',
  collegeIdParamValidator,
  validate,
  collegeController.adminDeleteCollege
);

/**
 * @route   PATCH /api/v1/admin/colleges/:id/publish
 * @desc    Publish a draft/archived college profile
 * @access  Private/Admin
 */
router.patch(
  '/colleges/:id/publish',
  collegeIdParamValidator,
  validate,
  collegeController.adminPublishCollege
);

/**
 * @route   PATCH /api/v1/admin/colleges/:id/archive
 * @desc    Archive a published/draft college profile
 * @access  Private/Admin
 */
router.patch(
  '/colleges/:id/archive',
  collegeIdParamValidator,
  validate,
  collegeController.adminArchiveCollege
);

// ────────────────────────────────────────────────────────────
// Admin Course CRUD Operations
// ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/courses
 * @desc    Get paginated admin view of courses (draft, published, archived)
 * @access  Private/Admin
 */
router.get('/courses', courseController.adminGetCourses);

/**
 * @route   GET /api/v1/admin/courses/:id
 * @desc    Get course details by ObjectID
 * @access  Private/Admin
 */
router.get(
  '/courses/:id',
  courseIdParamValidator,
  validate,
  courseController.adminGetCourseById
);

/**
 * @route   POST /api/v1/admin/courses
 * @desc    Create a new course profile
 * @access  Private/Admin
 */
router.post(
  '/courses',
  createCourseValidator,
  validate,
  courseController.adminCreateCourse
);

/**
 * @route   PUT /api/v1/admin/courses/:id
 * @desc    Update course parameters by ObjectID
 * @access  Private/Admin
 */
router.put(
  '/courses/:id',
  courseIdParamValidator,
  updateCourseValidator,
  validate,
  courseController.adminUpdateCourse
);

/**
 * @route   DELETE /api/v1/admin/courses/:id
 * @desc    Delete course document permanently
 * @access  Private/Admin
 */
router.delete(
  '/courses/:id',
  courseIdParamValidator,
  validate,
  courseController.adminDeleteCourse
);

/**
 * @route   PATCH /api/v1/admin/courses/:id/publish
 * @desc    Publish a draft/archived course profile
 * @access  Private/Admin
 */
router.patch(
  '/courses/:id/publish',
  courseIdParamValidator,
  validate,
  courseController.adminPublishCourse
);

/**
 * @route   PATCH /api/v1/admin/courses/:id/archive
 * @desc    Archive a published/draft course profile
 * @access  Private/Admin
 */
router.patch(
  '/courses/:id/archive',
  courseIdParamValidator,
  validate,
  courseController.adminArchiveCourse
);

// ────────────────────────────────────────────────────────────
// Admin Student Enquiry Ticket Operations
// ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/enquiries
 * @desc    Get enquiries with filters, pagination, and search
 * @access  Private/Admin
 */
router.get('/enquiries', enquiryController.adminGetEnquiries);

/**
 * @route   GET /api/v1/admin/enquiries/:id
 * @desc    Get detailed specs of a single enquiry ticket
 * @access  Private/Admin
 */
router.get(
  '/enquiries/:id',
  enquiryIdParamValidator,
  validate,
  enquiryController.adminGetEnquiryById
);

/**
 * @route   PATCH /api/v1/admin/enquiries/:id/status
 * @desc    Modify processing status on enquiry ticket
 * @access  Private/Admin
 */
router.patch(
  '/enquiries/:id/status',
  enquiryIdParamValidator,
  validate,
  enquiryController.adminUpdateStatus
);

/**
 * @route   PATCH /api/v1/admin/enquiries/:id/notes
 * @desc    Append resolution logs or CRM notes on enquiry ticket
 * @access  Private/Admin
 */
router.patch(
  '/enquiries/:id/notes',
  enquiryIdParamValidator,
  validate,
  enquiryController.adminUpdateNotes
);

/**
 * @route   DELETE /api/v1/admin/enquiries/:id
 * @desc    Permanently delete enquiry ticket
 * @access  Private/Admin
 */
router.delete(
  '/enquiries/:id',
  enquiryIdParamValidator,
  validate,
  enquiryController.adminDeleteEnquiry
);

// ────────────────────────────────────────────────────────────
// Admin Audit Trails & Config Settings
// ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Fetch platform administrative audit trails (paginated)
 * @access  Private/Admin
 */
router.get('/audit-logs', adminController.getAuditLogs);

/**
 * @route   GET /api/v1/admin/settings
 * @desc    Fetch system settings details
 * @access  Private/Admin
 */
router.get('/settings', adminController.getSettings);

/**
 * @route   PUT /api/v1/admin/settings
 * @desc    Modify system configurations parameters
 * @access  Private/Admin
 */
router.put('/settings', adminController.updateSettings);

/**
 * @route   GET /api/v1/admin/categories
 * @desc    Category statistics from colleges and courses
 * @access  Private/Admin
 */
router.get('/categories', adminController.getCategories);

/**
 * @route   GET /api/v1/admin/notifications
 * @desc    Admin notification feed and unread count
 * @access  Private/Admin
 */
router.get('/notifications', adminController.getNotifications);

/**
 * @route   GET /api/v1/admin/export
 * @desc    Export platform data as CSV
 * @access  Private/Admin
 */
router.get('/export', adminController.exportData);

export default router;
