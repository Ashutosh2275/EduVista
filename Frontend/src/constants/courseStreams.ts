/** UI taxonomy for course stream filters — labels only, not catalog data */
export const COURSE_STREAMS = [
  { id: 'engineering', label: 'Engineering', icon: 'Cpu' },
  { id: 'medical', label: 'Medical', icon: 'Heart' },
  { id: 'management', label: 'Management', icon: 'Briefcase' },
  { id: 'commerce', label: 'Commerce', icon: 'IndianRupee' },
  { id: 'law', label: 'Law', icon: 'Scale' },
  { id: 'design', label: 'Design', icon: 'Palette' },
  { id: 'science', label: 'Science', icon: 'FlaskConical' },
  { id: 'arts', label: 'Arts', icon: 'BookOpen' },
] as const;

export const CAREER_STREAM_LINKS = [
  { id: 'engineering', title: 'Engineering & Technology', description: 'Build the future with cutting-edge engineering programs.', icon: 'Code', href: '/courses?stream=engineering' },
  { id: 'medical', title: 'Medical & Healthcare', description: 'Pursue careers in medicine, nursing, and healthcare.', icon: 'Dna', href: '/courses?stream=medical' },
  { id: 'management', title: 'Business & Management', description: 'Lead organizations with MBA and business programs.', icon: 'BarChart', href: '/courses?stream=management' },
  { id: 'data', title: 'Data & Analytics', description: 'Master data science, AI, and analytics careers.', icon: 'Brain', href: '/courses?q=data+science' },
  { id: 'law', title: 'Law & Public Policy', description: 'Shape justice and governance through legal education.', icon: 'TrendingUp', href: '/courses?stream=law' },
  { id: 'design', title: 'Design & Creativity', description: 'Express innovation through design and visual arts.', icon: 'Package', href: '/courses?stream=design' },
] as const;
