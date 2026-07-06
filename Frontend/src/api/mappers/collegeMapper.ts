import type { College, Facility } from '../../types';
import { images } from '../../utils/images';

export interface ApiCollege {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  establishedYear?: number;
  collegeType: 'public' | 'private' | 'government';
  ownership?: string;
  accreditation?: string[];
  affiliation?: string;
  naacGrade?: string;
  nirfRanking?: number;
  aiMatchScore?: number;
  location: {
    city: string;
    state: string;
    country: string;
    address?: string;
  };
  logo?: string;
  banner?: string;
  galleryImages?: string[];
  coursesOffered?: string[] | { _id: string }[];
  departments?: string[];
  degreeLevels?: string[];
  fees?: {
    startingFees?: number;
    hostelFees?: number;
    otherCharges?: number;
  };
  placements?: {
    highestPackage?: number;
    averagePackage?: number;
    placementPercentage?: number;
    topRecruiters?: string[];
  };
  facilities?: {
    hostel?: boolean;
    library?: boolean;
    sports?: boolean;
    cafeteria?: boolean;
    medical?: boolean;
    wifi?: boolean;
    labs?: boolean;
    auditorium?: boolean;
    transport?: boolean;
  };
  category?: string;
  faqs?: Array<{ question: string; answer: string }>;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
  rating?: number;
  totalReviews?: number;
  admission?: {
    process?: string;
    eligibility?: string;
    requiredExams?: string[];
    importantDates?: { event: string; date: string }[];
  };
  status?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
}

const FACILITY_MAP: Array<{ key: keyof NonNullable<ApiCollege['facilities']>; name: string; icon: string }> = [
  { key: 'library', name: 'Library', icon: 'Library' },
  { key: 'labs', name: 'Research Labs', icon: 'FlaskConical' },
  { key: 'hostel', name: 'Hostel', icon: 'Building' },
  { key: 'sports', name: 'Sports Complex', icon: 'Trophy' },
  { key: 'wifi', name: 'Campus WiFi', icon: 'Monitor' },
  { key: 'cafeteria', name: 'Cafeteria', icon: 'Coffee' },
  { key: 'medical', name: 'Medical Center', icon: 'Heart' },
  { key: 'auditorium', name: 'Auditorium', icon: 'Theater' },
  { key: 'transport', name: 'Transport', icon: 'Bus' },
];

function deriveShortName(name: string): string {
  const words = name.split(/\s+/);
  if (words.length <= 3) return name;
  const acronym = words
    .filter((w) => w.length > 2 && /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('');
  return acronym.length >= 2 ? acronym : words.slice(0, 3).join(' ');
}

function mapFacilities(facilities?: ApiCollege['facilities']): Facility[] {
  if (!facilities) return [];
  return FACILITY_MAP.filter((f) => facilities[f.key]).map((f) => ({
    name: f.name,
    icon: f.icon,
    description: `${f.name} available on campus.`,
  }));
}

export function mapApiCollegeToCollege(api: ApiCollege): College & { slug: string } {
  const startingFees = api.fees?.startingFees ?? 100000;
  const hostelFees = api.fees?.hostelFees ?? 0;
  const maxFees = startingFees + hostelFees + (api.fees?.otherCharges ?? 50000);

  const courseCount = Array.isArray(api.coursesOffered) ? api.coursesOffered.length : 0;

  const highlights: string[] = [];
  if (api.nirfRanking) highlights.push(`NIRF Ranking #${api.nirfRanking}`);
  if (api.naacGrade) highlights.push(`NAAC Grade ${api.naacGrade}`);
  if (api.accreditation?.length) highlights.push(...api.accreditation.slice(0, 2));

  const admissionProcess = api.admission?.requiredExams?.length
    ? api.admission.requiredExams.map((exam, index) => ({
        step: index + 1,
        title: exam,
        description: api.admission?.process ?? 'Complete the admission process as per institute guidelines.',
      }))
    : [
        {
          step: 1,
          title: 'Application',
          description: api.admission?.process ?? 'Submit your application through the official portal.',
        },
      ];

  return {
    id: api._id,
    slug: api.slug,
    category: api.category,
    name: api.name,
    shortName: deriveShortName(api.name),
    logo: api.logo || images.fallback,
    coverImage: api.banner || images.fallback,
    location: {
      city: api.location.city,
      state: api.location.state,
      country: api.location.country ?? 'India',
    },
    type: api.collegeType === 'private' ? 'private' : 'public',
    established: api.establishedYear ?? 2000,
    accreditation: api.accreditation ?? [],
    ranking: {
      national: api.nirfRanking ?? 999,
      state: 1,
    },
    rating: api.rating ?? 4,
    reviewCount: api.totalReviews ?? 0,
    fees: {
      min: startingFees,
      max: maxFees,
      currency: 'INR',
    },
    placementRate: api.placements?.placementPercentage ?? 0,
    averagePackage: api.placements?.averagePackage ?? 0,
    topRecruiters: api.placements?.topRecruiters ?? [],
    courseCount,
    courses: [],
    facilities: mapFacilities(api.facilities),
    campusGallery: api.galleryImages?.length ? api.galleryImages : images.college.gallery,
    description: api.description ?? api.shortDescription ?? '',
    highlights,
    admissionProcess,
    faqs: api.faqs?.length ? api.faqs : [],
    contact: api.contact,
  };
}

export function mapApiColleges(colleges: ApiCollege[]): (College & { slug: string })[] {
  return colleges.map(mapApiCollegeToCollege);
}
