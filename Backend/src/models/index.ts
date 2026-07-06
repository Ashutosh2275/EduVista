/**
 * Models barrel export
 * Import all models here so they are registered with Mongoose
 * before any query is run.
 */
export { default as User, IUserDocument, IUser } from './User.model';
export { default as RefreshToken, IRefreshTokenDocument, IRefreshToken } from './RefreshToken.model';
export { default as College, ICollegeDocument, ICollege } from './College.model';
export { default as Course, ICourseDocument, ICourse } from './Course.model';
export { default as Wishlist, IWishlistDocument, IWishlist } from './Wishlist.model';
export { default as CompareSelection, ICompareSelectionDocument, ICompareSelection } from './Compare.model';
export { default as Enquiry, IEnquiryDocument, IEnquiry } from './Enquiry.model';
export { default as AuditLog, IAuditLogDocument, IAuditLog } from './AuditLog.model';
export { default as SystemSettings, ISystemSettingsDocument, ISystemSettings } from './SystemSettings.model';
