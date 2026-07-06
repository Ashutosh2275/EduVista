import type { CollegeCategory, ICollege } from '../src/models/College.model';

type CollegeSeed = Omit<ICollege, 'coursesOffered' | 'createdAt' | 'updatedAt'>;

const CATEGORY_META: Record<
  CollegeCategory,
  {
    departments: string[];
    exams: string[];
    recruiters: string[];
    fees: { starting: number; hostel: number; other: number };
    placement: { high: number; avg: number; pct: number };
    picsumCover: number;
    picsumLogo: number;
  }
> = {
  engineering: {
    departments: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'],
    exams: ['JEE Main', 'JEE Advanced'],
    recruiters: ['Google', 'Microsoft', 'Qualcomm', 'Texas Instruments'],
    fees: { starting: 225000, hostel: 35000, other: 15000 },
    placement: { high: 45000000, avg: 2100000, pct: 92 },
    picsumCover: 119,
    picsumLogo: 106,
  },
  medical: {
    departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Anatomy'],
    exams: ['NEET-UG', 'NEET-PG'],
    recruiters: ['Apollo Hospitals', 'Fortis', 'AIIMS Network', 'Max Healthcare'],
    fees: { starting: 650000, hostel: 80000, other: 25000 },
    placement: { high: 18000000, avg: 1200000, pct: 88 },
    picsumCover: 357,
    picsumLogo: 447,
  },
  management: {
    departments: ['Finance', 'Marketing', 'HR', 'Operations'],
    exams: ['CAT', 'XAT', 'GMAT'],
    recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'HUL'],
    fees: { starting: 450000, hostel: 60000, other: 20000 },
    placement: { high: 35000000, avg: 2800000, pct: 95 },
    picsumCover: 180,
    picsumLogo: 366,
  },
  law: {
    departments: ['Constitutional Law', 'Corporate Law', 'Criminal Law', 'International Law'],
    exams: ['CLAT', 'AILET'],
    recruiters: ['Trilegal', 'AZB Partners', 'Shardul Amarchand', 'Judiciary Services'],
    fees: { starting: 180000, hostel: 45000, other: 12000 },
    placement: { high: 25000000, avg: 900000, pct: 78 },
    picsumCover: 382,
    picsumLogo: 174,
  },
  design: {
    departments: ['Product Design', 'Communication Design', 'Fashion Design', 'UX Design'],
    exams: ['UCEED', 'NID DAT', 'NIFT'],
    recruiters: ['IDEO', 'Frog Design', 'Titan', 'Myntra'],
    fees: { starting: 320000, hostel: 75000, other: 22000 },
    placement: { high: 18000000, avg: 950000, pct: 86 },
    picsumCover: 399,
    picsumLogo: 188,
  },
  science: {
    departments: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    exams: ['JAM', 'GATE', 'CUET-PG'],
    recruiters: ['ISRO', 'DRDO', 'CSIR Labs', 'Biocon'],
    fees: { starting: 120000, hostel: 30000, other: 10000 },
    placement: { high: 22000000, avg: 1100000, pct: 80 },
    picsumCover: 400,
    picsumLogo: 160,
  },
  arts: {
    departments: ['English', 'History', 'Economics', 'Psychology'],
    exams: ['CUET-UG', 'DUET'],
    recruiters: ['Deloitte', 'UNICEF', 'Media Houses', 'Civil Services'],
    fees: { starting: 55000, hostel: 22000, other: 8000 },
    placement: { high: 12000000, avg: 550000, pct: 68 },
    picsumCover: 429,
    picsumLogo: 107,
  },
};

interface CollegeInput {
  name: string;
  slug: string;
  category: CollegeCategory;
  city: string;
  state: string;
  collegeType?: 'public' | 'private' | 'government';
  ownership?: string;
  establishedYear?: number;
  nirfRanking?: number;
  naacGrade?: string;
  rating?: number;
  totalReviews?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  aiMatchScore?: number;
}

function img(category: CollegeCategory, slug: string, kind: 'cover' | 'logo') {
  return `/images/colleges/${category}/${slug}-${kind}.jpg`;
}

function gallery(category: CollegeCategory) {
  return [1, 2, 3].map((n) => `/images/colleges/${category}/gallery-${n}.jpg`);
}

function buildCollege(input: CollegeInput, index: number): CollegeSeed {
  const meta = CATEGORY_META[input.category];
  const domain = input.slug.replace(/-/g, '');
  const rating = input.rating ?? 4.2 + (index % 7) * 0.1;

  return {
    name: input.name,
    slug: input.slug,
    category: input.category,
    shortDescription: `${input.name} is a leading ${input.category} institution in ${input.city}, known for academic excellence and strong industry connections.`,
    description: `${input.name} offers world-class programs in ${meta.departments.join(', ')}. Students benefit from modern infrastructure, experienced faculty, and excellent placement support across India and abroad.`,
    establishedYear: input.establishedYear ?? 1950 + (index % 50),
    collegeType: input.collegeType ?? (index % 3 === 0 ? 'private' : 'public'),
    ownership: input.ownership ?? (input.collegeType === 'private' ? 'Private Trust' : 'Government'),
    accreditation: ['NAAC A+', 'UGC'],
    affiliation: 'Autonomous / University Affiliated',
    naacGrade: input.naacGrade ?? 'A+',
    nirfRanking: input.nirfRanking ?? 5 + index * 2,
    aiMatchScore: input.aiMatchScore ?? 90 - (index % 10),
    location: {
      address: `Campus Road, ${input.city}`,
      city: input.city,
      state: input.state,
      country: 'India',
    },
    logo: img(input.category, input.slug, 'logo'),
    banner: img(input.category, input.slug, 'cover'),
    galleryImages: gallery(input.category),
    departments: meta.departments,
    degreeLevels: input.category === 'medical' ? ['UG', 'PG'] : ['UG', 'PG', 'PhD'],
    fees: {
      startingFees: meta.fees.starting + (index % 5) * 10000,
      hostelFees: meta.fees.hostel,
      otherCharges: meta.fees.other,
    },
    placements: {
      highestPackage: meta.placement.high,
      averagePackage: meta.placement.avg,
      placementPercentage: meta.placement.pct - (index % 5),
      topRecruiters: meta.recruiters,
    },
    facilities: {
      hostel: true,
      library: true,
      sports: true,
      cafeteria: true,
      medical: input.category === 'medical' ? true : index % 2 === 0,
      wifi: true,
      labs: true,
      auditorium: true,
      transport: index % 3 !== 0,
    },
    rating: Math.min(5, rating),
    totalReviews: input.totalReviews ?? 400 + index * 85,
    totalStudents: 3000 + index * 500,
    facultyCount: 200 + index * 30,
    admission: {
      process: `Apply through the official portal and qualify ${meta.exams.join(' / ')} as applicable.`,
      eligibility: 'Eligibility criteria vary by program — refer to the official admission brochure.',
      requiredExams: meta.exams,
      importantDates: [
        { event: 'Application Deadline', date: new Date('2026-05-31') },
        { event: 'Entrance Examination', date: new Date('2026-06-15') },
        { event: 'Counselling Round 1', date: new Date('2026-07-20') },
      ],
    },
    faqs: [
      {
        question: `What entrance exams are accepted at ${input.name}?`,
        answer: `${input.name} accepts ${meta.exams.join(', ')} for most programs. Check the admission page for program-specific requirements.`,
      },
      {
        question: 'Is hostel accommodation available?',
        answer: 'Yes, separate hostel facilities are available for boys and girls with mess, Wi-Fi, and 24/7 security.',
      },
      {
        question: 'What is the average placement package?',
        answer: `The average package is approximately ₹${(meta.placement.avg / 100000).toFixed(1)} LPA with ${meta.placement.pct}% students placed.`,
      },
    ],
    contact: {
      email: `admissions@${domain}.edu.in`,
      phone: `98${String(10000000 + index).slice(0, 8)}`,
      website: `https://www.${input.slug}.edu.in`,
      address: `Admissions Office, ${input.name}, ${input.city}, ${input.state}, India`,
    },
    seo: {
      metaTitle: `${input.name} — Admissions, Fees, Placements | EduVista`,
      metaDescription: `Explore ${input.name} programs, fees, rankings, placements, and admission process on EduVista.`,
    },
    status: 'published',
    isFeatured: input.isFeatured ?? index < 2,
    isTrending: input.isTrending ?? index % 2 === 0,
  };
}

const COLLEGE_INPUTS: CollegeInput[] = [
  // Engineering (4)
  { name: 'IIT Delhi', slug: 'iit-delhi', category: 'engineering', city: 'New Delhi', state: 'Delhi', nirfRanking: 2, naacGrade: 'A++', rating: 4.8, isFeatured: true, isTrending: true },
  { name: 'IIT Bombay', slug: 'iit-bombay', category: 'engineering', city: 'Mumbai', state: 'Maharashtra', nirfRanking: 3, naacGrade: 'A++', rating: 4.9, isFeatured: true, isTrending: true },
  { name: 'BITS Pilani', slug: 'bits-pilani', category: 'engineering', city: 'Pilani', state: 'Rajasthan', collegeType: 'private', nirfRanking: 25, rating: 4.6, isFeatured: true },
  { name: 'NIT Trichy', slug: 'nit-trichy', category: 'engineering', city: 'Tiruchirappalli', state: 'Tamil Nadu', nirfRanking: 9, rating: 4.5, isTrending: true },
  // Medical (4)
  { name: 'AIIMS New Delhi', slug: 'aiims-delhi', category: 'medical', city: 'New Delhi', state: 'Delhi', nirfRanking: 1, rating: 4.9, isFeatured: true, isTrending: true },
  { name: 'Christian Medical College Vellore', slug: 'cmc-vellore', category: 'medical', city: 'Vellore', state: 'Tamil Nadu', collegeType: 'private', nirfRanking: 4, rating: 4.8, isFeatured: true },
  { name: 'Maulana Azad Medical College', slug: 'mamc-delhi', category: 'medical', city: 'New Delhi', state: 'Delhi', nirfRanking: 12, rating: 4.5 },
  { name: 'King George Medical University', slug: 'kgmu-lucknow', category: 'medical', city: 'Lucknow', state: 'Uttar Pradesh', nirfRanking: 18, rating: 4.4, isTrending: true },
  // Management (4)
  { name: 'IIM Ahmedabad', slug: 'iim-ahmedabad', category: 'management', city: 'Ahmedabad', state: 'Gujarat', nirfRanking: 1, rating: 4.9, isFeatured: true, isTrending: true },
  { name: 'FMS Delhi', slug: 'fms-delhi', category: 'management', city: 'New Delhi', state: 'Delhi', nirfRanking: 5, rating: 4.7, isFeatured: true },
  { name: 'XLRI Jamshedpur', slug: 'xlri-jamshedpur', category: 'management', city: 'Jamshedpur', state: 'Jharkhand', collegeType: 'private', nirfRanking: 8, rating: 4.8, isTrending: true },
  { name: 'SPJIMR Mumbai', slug: 'spjimr-mumbai', category: 'management', city: 'Mumbai', state: 'Maharashtra', collegeType: 'private', nirfRanking: 10, rating: 4.6 },
  // Law (4)
  { name: 'NLSIU Bangalore', slug: 'nlsiu-bangalore', category: 'law', city: 'Bangalore', state: 'Karnataka', nirfRanking: 1, rating: 4.8, isFeatured: true, isTrending: true },
  { name: 'NLU Delhi', slug: 'nlu-delhi', category: 'law', city: 'New Delhi', state: 'Delhi', nirfRanking: 2, rating: 4.7, isFeatured: true },
  { name: 'NALSAR Hyderabad', slug: 'nalsar-hyderabad', category: 'law', city: 'Hyderabad', state: 'Telangana', nirfRanking: 3, rating: 4.6, isTrending: true },
  { name: 'Government Law College Mumbai', slug: 'glc-mumbai', category: 'law', city: 'Mumbai', state: 'Maharashtra', nirfRanking: 15, rating: 4.3 },
  // Design (4)
  { name: 'National Institute of Design Ahmedabad', slug: 'nid-ahmedabad', category: 'design', city: 'Ahmedabad', state: 'Gujarat', nirfRanking: 1, rating: 4.8, isFeatured: true, isTrending: true },
  { name: 'MIT Institute of Design Pune', slug: 'mitid-pune', category: 'design', city: 'Pune', state: 'Maharashtra', collegeType: 'private', nirfRanking: 12, rating: 4.5, isFeatured: true },
  { name: 'Pearl Academy Delhi', slug: 'pearl-academy-delhi', category: 'design', city: 'New Delhi', state: 'Delhi', collegeType: 'private', nirfRanking: 18, rating: 4.4, isTrending: true },
  { name: 'Srishti Manipal Bangalore', slug: 'srishti-bangalore', category: 'design', city: 'Bangalore', state: 'Karnataka', collegeType: 'private', nirfRanking: 20, rating: 4.3 },
  // Science (4)
  { name: 'IISc Bangalore', slug: 'iisc-bangalore', category: 'science', city: 'Bangalore', state: 'Karnataka', nirfRanking: 1, naacGrade: 'A++', rating: 4.9, isFeatured: true, isTrending: true },
  { name: 'St. Xavier\'s College Mumbai', slug: 'st-xaviers-mumbai', category: 'science', city: 'Mumbai', state: 'Maharashtra', collegeType: 'private', nirfRanking: 14, rating: 4.5, isFeatured: true },
  { name: 'IISER Pune', slug: 'iiser-pune', category: 'science', city: 'Pune', state: 'Maharashtra', nirfRanking: 6, rating: 4.7, isTrending: true },
  { name: 'Delhi University — Faculty of Science', slug: 'du-science', category: 'science', city: 'New Delhi', state: 'Delhi', nirfRanking: 11, rating: 4.4 },
  // Arts & Humanities (4)
  { name: 'Delhi University — Faculty of Arts', slug: 'du-arts', category: 'arts', city: 'New Delhi', state: 'Delhi', nirfRanking: 8, rating: 4.5, isFeatured: true, isTrending: true },
  { name: 'Jawaharlal Nehru University', slug: 'jnu-delhi', category: 'arts', city: 'New Delhi', state: 'Delhi', nirfRanking: 3, rating: 4.6, isFeatured: true },
  { name: 'Loyola College Chennai', slug: 'loyola-chennai', category: 'arts', city: 'Chennai', state: 'Tamil Nadu', collegeType: 'private', nirfRanking: 12, rating: 4.5, isTrending: true },
  { name: 'Christ University Bangalore', slug: 'christ-bangalore', category: 'arts', city: 'Bangalore', state: 'Karnataka', collegeType: 'private', nirfRanking: 16, rating: 4.4 },
];

export const COLLEGE_SEEDS: CollegeSeed[] = COLLEGE_INPUTS.map((c, i) => buildCollege(c, i));

export interface CourseSeedInput {
  name: string;
  slug: string;
  stream: 'engineering' | 'medical' | 'management' | 'law' | 'design' | 'science' | 'arts';
  degreeLevel: 'UG' | 'PG' | 'PhD' | 'Diploma';
  duration: string;
  specialization: string[];
  tuitionFees: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  categories: CollegeCategory[];
}

export const COURSE_INPUTS: CourseSeedInput[] = [
  { name: 'B.Tech Computer Science & Engineering', slug: 'btech-cse', stream: 'engineering', degreeLevel: 'UG', duration: '4 years', specialization: ['AI', 'Systems', 'Software Engineering'], tuitionFees: 280000, isFeatured: true, isTrending: true, categories: ['engineering'] },
  { name: 'B.Tech Artificial Intelligence & Machine Learning', slug: 'btech-ai-ml', stream: 'engineering', degreeLevel: 'UG', duration: '4 years', specialization: ['Deep Learning', 'NLP', 'Computer Vision'], tuitionFees: 320000, isFeatured: true, categories: ['engineering'] },
  { name: 'B.Tech Data Science', slug: 'btech-data-science', stream: 'engineering', degreeLevel: 'UG', duration: '4 years', specialization: ['Big Data', 'Analytics', 'Statistics'], tuitionFees: 300000, isTrending: true, categories: ['engineering'] },
  { name: 'B.Tech Mechanical Engineering', slug: 'btech-mechanical', stream: 'engineering', degreeLevel: 'UG', duration: '4 years', specialization: ['Thermodynamics', 'Manufacturing', 'Robotics'], tuitionFees: 240000, categories: ['engineering'] },
  { name: 'B.Tech Civil Engineering', slug: 'btech-civil', stream: 'engineering', degreeLevel: 'UG', duration: '4 years', specialization: ['Structures', 'Transportation', 'Environmental'], tuitionFees: 220000, categories: ['engineering'] },
  { name: 'B.Tech Electrical Engineering', slug: 'btech-electrical', stream: 'engineering', degreeLevel: 'UG', duration: '4 years', specialization: ['Power Systems', 'Control Systems', 'Electronics'], tuitionFees: 250000, categories: ['engineering'] },
  { name: 'MBBS', slug: 'mbbs', stream: 'medical', degreeLevel: 'UG', duration: '5.5 years', specialization: ['General Medicine', 'Surgery', 'Community Health'], tuitionFees: 850000, isFeatured: true, isTrending: true, categories: ['medical'] },
  { name: 'BDS — Bachelor of Dental Surgery', slug: 'bds', stream: 'medical', degreeLevel: 'UG', duration: '5 years', specialization: ['Oral Surgery', 'Orthodontics'], tuitionFees: 650000, categories: ['medical'] },
  { name: 'BAMS — Bachelor of Ayurvedic Medicine', slug: 'bams', stream: 'medical', degreeLevel: 'UG', duration: '5.5 years', specialization: ['Ayurveda', 'Herbal Medicine'], tuitionFees: 400000, categories: ['medical'] },
  { name: 'B.Sc Nursing', slug: 'bsc-nursing', stream: 'medical', degreeLevel: 'UG', duration: '4 years', specialization: ['Clinical Nursing', 'Community Health'], tuitionFees: 280000, isTrending: true, categories: ['medical'] },
  { name: 'MBA', slug: 'mba', stream: 'management', degreeLevel: 'PG', duration: '2 years', specialization: ['Strategy', 'Leadership', 'Consulting'], tuitionFees: 550000, isFeatured: true, isTrending: true, categories: ['management', 'engineering'] },
  { name: 'BBA', slug: 'bba', stream: 'management', degreeLevel: 'UG', duration: '3 years', specialization: ['Business Analytics', 'Entrepreneurship'], tuitionFees: 220000, isFeatured: true, categories: ['management', 'arts'] },
  { name: 'MBA Finance', slug: 'mba-finance', stream: 'management', degreeLevel: 'PG', duration: '2 years', specialization: ['Investment Banking', 'Corporate Finance'], tuitionFees: 580000, categories: ['management'] },
  { name: 'MBA Marketing', slug: 'mba-marketing', stream: 'management', degreeLevel: 'PG', duration: '2 years', specialization: ['Brand Management', 'Digital Marketing'], tuitionFees: 560000, isTrending: true, categories: ['management'] },
  { name: 'MBA Human Resources', slug: 'mba-hr', stream: 'management', degreeLevel: 'PG', duration: '2 years', specialization: ['Talent Management', 'Organizational Behavior'], tuitionFees: 540000, categories: ['management'] },
  { name: 'LLB', slug: 'llb', stream: 'law', degreeLevel: 'UG', duration: '3 years', specialization: ['Corporate Law', 'Criminal Law'], tuitionFees: 150000, categories: ['law', 'arts'] },
  { name: 'BA LLB (Integrated)', slug: 'ba-llb', stream: 'law', degreeLevel: 'UG', duration: '5 years', specialization: ['Constitutional Law', 'International Law'], tuitionFees: 280000, isFeatured: true, categories: ['law'] },
  { name: 'LLM', slug: 'llm', stream: 'law', degreeLevel: 'PG', duration: '1 year', specialization: ['Corporate Law', 'IP Law'], tuitionFees: 200000, categories: ['law'] },
  { name: 'B.Des', slug: 'b-des', stream: 'design', degreeLevel: 'UG', duration: '4 years', specialization: ['Product Design', 'Communication Design'], tuitionFees: 380000, isFeatured: true, isTrending: true, categories: ['design', 'engineering'] },
  { name: 'M.Des', slug: 'm-des', stream: 'design', degreeLevel: 'PG', duration: '2 years', specialization: ['Interaction Design', 'Design Research'], tuitionFees: 420000, categories: ['design'] },
  { name: 'B.Des Fashion Design', slug: 'b-des-fashion', stream: 'design', degreeLevel: 'UG', duration: '4 years', specialization: ['Apparel', 'Textile Design'], tuitionFees: 360000, isTrending: true, categories: ['design'] },
  { name: 'B.Des UX Design', slug: 'b-des-ux', stream: 'design', degreeLevel: 'UG', duration: '4 years', specialization: ['UI/UX', 'Design Systems'], tuitionFees: 390000, categories: ['design'] },
  { name: 'B.Sc', slug: 'bsc', stream: 'science', degreeLevel: 'UG', duration: '3 years', specialization: ['Physics', 'Chemistry', 'Biology'], tuitionFees: 120000, categories: ['science', 'arts'] },
  { name: 'M.Sc Physics', slug: 'msc-physics', stream: 'science', degreeLevel: 'PG', duration: '2 years', specialization: ['Quantum Mechanics', 'Astrophysics'], tuitionFees: 90000, categories: ['science'] },
  { name: 'M.Sc Chemistry', slug: 'msc-chemistry', stream: 'science', degreeLevel: 'PG', duration: '2 years', specialization: ['Organic Chemistry', 'Analytical Chemistry'], tuitionFees: 95000, categories: ['science'] },
  { name: 'B.Tech Biotechnology', slug: 'btech-biotechnology', stream: 'science', degreeLevel: 'UG', duration: '4 years', specialization: ['Genetics', 'Bioinformatics'], tuitionFees: 260000, isTrending: true, categories: ['science', 'medical'] },
  { name: 'BA English', slug: 'ba-english', stream: 'arts', degreeLevel: 'UG', duration: '3 years', specialization: ['Literature', 'Linguistics'], tuitionFees: 65000, categories: ['arts'] },
  { name: 'BA History', slug: 'ba-history', stream: 'arts', degreeLevel: 'UG', duration: '3 years', specialization: ['Modern History', 'Archaeology'], tuitionFees: 60000, categories: ['arts'] },
  { name: 'BA Economics', slug: 'ba-economics', stream: 'arts', degreeLevel: 'UG', duration: '3 years', specialization: ['Microeconomics', 'Econometrics'], tuitionFees: 75000, isFeatured: true, categories: ['arts'] },
  { name: 'BA Psychology', slug: 'ba-psychology', stream: 'arts', degreeLevel: 'UG', duration: '3 years', specialization: ['Clinical Psychology', 'Counseling'], tuitionFees: 80000, isTrending: true, categories: ['arts'] },
];

export const CATEGORY_PICSUM: Record<CollegeCategory, { cover: number; logo: number; gallery: number[] }> =
  Object.fromEntries(
    (Object.keys(CATEGORY_META) as CollegeCategory[]).map((k) => [
      k,
      { cover: CATEGORY_META[k].picsumCover, logo: CATEGORY_META[k].picsumLogo, gallery: [250, 251, 289] },
    ])
  ) as Record<CollegeCategory, { cover: number; logo: number; gallery: number[] }>;
