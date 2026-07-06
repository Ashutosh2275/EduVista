import type { CourseCatalogItem, CourseLevel, CourseMode, CourseStream } from '../../types';
import { streamCoverImage } from '../../utils/images';

export interface ApiCourse {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  degreeLevel: 'UG' | 'PG' | 'Diploma' | 'PhD';
  stream: CourseStream | 'other';
  specialization?: string[];
  duration: string;
  mode: 'full-time' | 'part-time' | 'online';
  fees?: {
    tuitionFees?: number;
    hostelFees?: number;
    otherCharges?: number;
  };
  placement?: {
    averagePackage?: number;
    highestPackage?: number;
    placementRate?: number;
  };
  rating?: number;
  reviewCount?: number;
  numberOfCollegesOffering?: number;
  academics?: {
    eligibility?: string;
    entranceExams?: string[];
  };
  isFeatured?: boolean;
  isTrending?: boolean;
  status?: string;
}

const DEGREE_LEVEL_MAP: Record<ApiCourse['degreeLevel'], CourseLevel> = {
  UG: 'undergraduate',
  PG: 'postgraduate',
  Diploma: 'undergraduate',
  PhD: 'doctoral',
};

const DEGREE_LABEL: Record<ApiCourse['degreeLevel'], string> = {
  UG: 'Bachelor',
  PG: 'Master',
  Diploma: 'Diploma',
  PhD: 'PhD',
};

function normalizeStream(stream: ApiCourse['stream']): CourseStream {
  const allowed: CourseStream[] = ['engineering', 'medical', 'management', 'commerce', 'law', 'design', 'science', 'arts'];
  return allowed.includes(stream as CourseStream) ? (stream as CourseStream) : 'engineering';
}

export function mapApiCourseToCatalogItem(api: ApiCourse): CourseCatalogItem & { slug: string } {
  const stream = normalizeStream(api.stream);
  const tuition = api.fees?.tuitionFees ?? 0;
  const hostel = api.fees?.hostelFees ?? 0;

  return {
    id: api._id,
    slug: api.slug,
    name: api.name,
    stream,
    duration: api.duration,
    degree: DEGREE_LABEL[api.degreeLevel] ?? api.degreeLevel,
    level: DEGREE_LEVEL_MAP[api.degreeLevel] ?? 'undergraduate',
    mode: api.mode as CourseMode,
    averageFees: tuition + hostel,
    averagePackage: api.placement?.averagePackage ?? 0,
    collegesCount: api.numberOfCollegesOffering ?? 0,
    rating: api.rating ?? 4,
    reviewCount: api.reviewCount ?? 0,
    description: api.shortDescription ?? api.fullDescription ?? '',
    careerOpportunities: api.specialization ?? [],
    coverImage: streamCoverImage(stream),
    featured: api.isFeatured,
    trending: api.isTrending,
  };
}

export function mapApiCourses(courses: ApiCourse[]): (CourseCatalogItem & { slug: string })[] {
  return courses.map(mapApiCourseToCatalogItem);
}
