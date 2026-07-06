export interface College {
  id: string;
  slug?: string;
  category?: string;
  name: string;
  shortName: string;
  logo: string;
  coverImage: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  type: 'public' | 'private';
  established: number;
  accreditation: string[];
  ranking: {
    national: number;
    state: number;
  };
  rating: number;
  reviewCount: number;
  fees: {
    min: number;
    max: number;
    currency: string;
  };
  placementRate: number;
  averagePackage: number;
  topRecruiters: string[];
  courseCount: number;
  courses: Course[];
  facilities: Facility[];
  campusGallery: string[];
  description: string;
  highlights: string[];
  admissionProcess: AdmissionStep[];
  faqs: FAQ[];
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
}

export interface Course {
  id: string;
  collegeId: string;
  name: string;
  type: 'undergraduate' | 'postgraduate' | 'doctoral' | 'diploma';
  duration: string;
  fees: number;
  eligibility: string;
  seats: number;
  specialization: string[];
  description: string;
  curriculum: string[];
  careerOpportunities: string[];
}

export interface Facility {
  name: string;
  icon: string;
  description: string;
}

export interface AdmissionStep {
  step: number;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Review {
  id: string;
  collegeId: string;
  userId: string;
  userName: string;
  avatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
}

export interface CareerPath {
  id: string;
  title: string;
  icon: string;
  description: string;
  averageSalary: string;
  growth: string;
  courses: string[];
}

export interface StudentSuccess {
  id: string;
  name: string;
  avatar: string;
  college: string;
  course: string;
  year: number;
  story: string;
  achievement: string;
  currentRole: string;
  company: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  tags: string[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  savedColleges: string[];
  compareHistory: string[][];
  recentSearches: string[];
  preferences: {
    interestedFields: string[];
    preferredLocations: string[];
    budgetRange: [number, number];
  };
}

export type SortOption = 'ranking' | 'rating' | 'fees_low' | 'fees_high' | 'placement';

export interface FilterOptions {
  type?: 'public' | 'private';
  location?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  courses?: string[];
  facilities?: string[];
}

export type CourseStream =
  | 'engineering'
  | 'medical'
  | 'management'
  | 'commerce'
  | 'law'
  | 'design'
  | 'science'
  | 'arts';

export type CourseLevel = 'undergraduate' | 'postgraduate' | 'doctoral';

export type CourseMode = 'full-time' | 'part-time' | 'online';

export interface CourseCatalogItem {
  id: string;
  slug?: string;
  name: string;
  stream: CourseStream;
  duration: string;
  degree: string;
  level: CourseLevel;
  mode: CourseMode;
  averageFees: number;
  averagePackage: number;
  collegesCount: number;
  rating: number;
  reviewCount: number;
  description: string;
  careerOpportunities: string[];
  trending?: boolean;
  featured?: boolean;
  coverImage: string;
}

export type CourseSortOption =
  | 'rating'
  | 'fees_low'
  | 'fees_high'
  | 'package'
  | 'colleges'
  | 'name';

export interface InsightArticle {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  trending?: boolean;
}
