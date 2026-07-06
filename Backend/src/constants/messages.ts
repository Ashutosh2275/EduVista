/**
 * API Success / Info Messages
 * Reusable user-facing message strings.
 */
export const MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Account created successfully. Please sign in.',
  LOGIN_SUCCESS: 'Welcome back! You are now signed in.',
  LOGOUT_SUCCESS: 'You have been signed out successfully.',
  TOKEN_REFRESHED: 'Access token refreshed.',
  FORGOT_PASSWORD_EMAIL_SENT: 'Password reset link sent successfully.',
  PASSWORD_RESET_SUCCESS: 'Your password has been reset. You can now sign in.',

  // User
  PROFILE_FETCHED: 'Profile retrieved successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  ACCOUNT_DELETED: 'Account deleted successfully.',

  // Wishlist
  ADDED_TO_WISHLIST: 'College added to your wishlist.',
  REMOVED_FROM_WISHLIST: 'College removed from your wishlist.',
  WISHLIST_FETCHED: 'Wishlist retrieved successfully.',

  // Compare
  COMPARISON_SAVED: 'Comparison saved to your history.',
  COMPARE_HISTORY_FETCHED: 'Comparison history retrieved successfully.',

  // Enquiry
  ENQUIRY_SUBMITTED: 'Your enquiry has been received. We will get back to you within 24-48 hours.',
  ENQUIRY_UPDATED: 'Enquiry status updated.',
  ENQUIRY_DELETED: 'Enquiry deleted.',

  // Content
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  FETCHED: 'Data retrieved successfully.',

  // Upload
  UPLOAD_SUCCESS: 'File uploaded successfully.',
  UPLOAD_DELETED: 'File deleted successfully.',

  // Newsletter
  NEWSLETTER_SUBSCRIBED: 'You have been subscribed to our newsletter.',

  // Generic
  OPERATION_SUCCESS: 'Operation completed successfully.',
} as const;

export type MessageKey = keyof typeof MESSAGES;
