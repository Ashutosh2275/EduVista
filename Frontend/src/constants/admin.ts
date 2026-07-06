export const COLLEGE_CATEGORIES = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'medical', label: 'Medical' },
  { value: 'management', label: 'Management' },
  { value: 'law', label: 'Law' },
  { value: 'design', label: 'Design' },
  { value: 'science', label: 'Science' },
  { value: 'arts', label: 'Arts' },
] as const;

export const COURSE_STREAMS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'medical', label: 'Medical' },
  { value: 'management', label: 'Management' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'law', label: 'Law' },
  { value: 'design', label: 'Design' },
  { value: 'science', label: 'Science' },
  { value: 'arts', label: 'Arts' },
  { value: 'other', label: 'Other' },
] as const;

export const COLLEGE_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
] as const;

export const ENQUIRY_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
] as const;

export const USER_ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'USER', label: 'Student' },
  { value: 'ADMIN', label: 'Admin' },
] as const;

export const EXPORT_TYPES = [
  { value: 'dashboard', label: 'Dashboard Summary' },
  { value: 'users', label: 'Users' },
  { value: 'colleges', label: 'Colleges' },
  { value: 'courses', label: 'Courses' },
  { value: 'enquiries', label: 'Enquiries' },
  { value: 'analytics', label: 'Analytics' },
] as const;

export type ExportType = (typeof EXPORT_TYPES)[number]['value'];
