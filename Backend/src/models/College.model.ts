import mongoose, { Document, Schema, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────────────────────

export interface ILocation {
  address?: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface IFees {
  startingFees?: number;
  hostelFees?: number;
  otherCharges?: number;
}

export interface IPlacements {
  highestPackage?: number;
  averagePackage?: number;
  placementPercentage?: number;
  topRecruiters: string[];
}

export interface IFacilities {
  hostel: boolean;
  library: boolean;
  sports: boolean;
  cafeteria: boolean;
  medical: boolean;
  wifi: boolean;
  labs: boolean;
  auditorium: boolean;
  transport: boolean;
}

export interface IAdmissionDate {
  event: string;
  date: Date;
}

export interface IAdmissionInfo {
  process?: string;
  eligibility?: string;
  requiredExams: string[];
  importantDates: IAdmissionDate[];
}

export interface ISEOInfo {
  metaTitle?: string;
  metaDescription?: string;
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

export type CollegeCategory =
  | 'engineering'
  | 'medical'
  | 'management'
  | 'law'
  | 'design'
  | 'science'
  | 'arts';

export interface ICollege {
  name: string;
  slug: string;
  category: CollegeCategory;
  description?: string;
  shortDescription?: string;
  establishedYear?: number;
  collegeType: 'public' | 'private' | 'government';
  ownership: string;
  accreditation: string[];
  affiliation?: string;
  naacGrade?: string;
  nirfRanking?: number;
  aiMatchScore?: number;
  
  location: ILocation;
  
  logo?: string;
  banner?: string;
  galleryImages: string[];
  
  coursesOffered: mongoose.Types.ObjectId[]; // References Course model
  departments: string[];
  degreeLevels: string[];
  
  fees: IFees;
  placements: IPlacements;
  facilities: IFacilities;
  
  rating: number;
  totalReviews: number;
  totalStudents?: number;
  facultyCount?: number;
  
  admission: IAdmissionInfo;
  seo: ISEOInfo;

  faqs: IFAQ[];
  contact: IContactInfo;
  
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isTrending: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollegeDocument extends ICollege, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────

const LocationSchema = new Schema<ILocation>(
  {
    address: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const FeesSchema = new Schema<IFees>(
  {
    startingFees: { type: Number, default: 0 },
    hostelFees: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
  },
  { _id: false }
);

const PlacementsSchema = new Schema<IPlacements>(
  {
    highestPackage: { type: Number, default: 0 },
    averagePackage: { type: Number, default: 0 },
    placementPercentage: { type: Number, default: 0 },
    topRecruiters: { type: [String], default: [] },
  },
  { _id: false }
);

const FacilitiesSchema = new Schema<IFacilities>(
  {
    hostel: { type: Boolean, default: false },
    library: { type: Boolean, default: false },
    sports: { type: Boolean, default: false },
    cafeteria: { type: Boolean, default: false },
    medical: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    labs: { type: Boolean, default: false },
    auditorium: { type: Boolean, default: false },
    transport: { type: Boolean, default: false },
  },
  { _id: false }
);

const AdmissionDateSchema = new Schema<IAdmissionDate>(
  {
    event: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const AdmissionInfoSchema = new Schema<IAdmissionInfo>(
  {
    process: { type: String },
    eligibility: { type: String },
    requiredExams: { type: [String], default: [] },
    importantDates: { type: [AdmissionDateSchema], default: [] },
  },
  { _id: false }
);

const SEOSchema = new Schema<ISEOInfo>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
  },
  { _id: false }
);

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ContactInfoSchema = new Schema<IContactInfo>(
  {
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { _id: false }
);

const CollegeSchema = new Schema<ICollegeDocument>(
  {
    name: {
      type: String,
      required: [true, 'College name is required.'],
      unique: true,
      trim: true,
    },
    
    slug: {
      type: String,
      required: [true, 'SEO slug is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      enum: ['engineering', 'medical', 'management', 'law', 'design', 'science', 'arts'],
      required: [true, 'College category is required.'],
      index: true,
    },
    
    description: { type: String },
    shortDescription: { type: String },
    establishedYear: { type: Number },
    
    collegeType: {
      type: String,
      enum: ['public', 'private', 'government'],
      required: [true, 'College type (public/private/government) is required.'],
    },
    
    ownership: { type: String, required: true, trim: true },
    accreditation: { type: [String], default: [] },
    affiliation: { type: String, trim: true },
    naacGrade: { type: String, trim: true },
    nirfRanking: { type: Number },
    aiMatchScore: { type: Number, default: 0 },
    
    location: { type: LocationSchema, required: true },
    
    logo: { type: String },
    banner: { type: String },
    galleryImages: { type: [String], default: [] },
    
    coursesOffered: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    
    departments: { type: [String], default: [] },
    degreeLevels: { type: [String], default: [] },
    
    fees: { type: FeesSchema, default: () => ({ startingFees: 0, hostelFees: 0, otherCharges: 0 }) },
    placements: { type: PlacementsSchema, default: () => ({ highestPackage: 0, averagePackage: 0, placementPercentage: 0, topRecruiters: [] }) },
    facilities: {
      type: FacilitiesSchema,
      default: () => ({
        hostel: false,
        library: false,
        sports: false,
        cafeteria: false,
        medical: false,
        wifi: false,
        labs: false,
        auditorium: false,
        transport: false,
      }),
    },
    
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalStudents: { type: Number },
    facultyCount: { type: Number },
    
    admission: { type: AdmissionInfoSchema, default: () => ({ requiredExams: [], importantDates: [] }) },
    seo: { type: SEOSchema, default: () => ({}) },

    faqs: { type: [FAQSchema], default: [] },
    contact: { type: ContactInfoSchema, default: () => ({}) },
    
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ────────────────────────────────────────────────────────────
// Indexes & Full-Text Search
// ────────────────────────────────────────────────────────────

CollegeSchema.index({ slug: 1 }, { unique: true });
CollegeSchema.index({ category: 1 });
CollegeSchema.index({ status: 1 });
CollegeSchema.index({ isFeatured: 1 });
CollegeSchema.index({ isTrending: 1 });
CollegeSchema.index({ 'location.city': 1, 'location.state': 1 });
CollegeSchema.index({ 'fees.startingFees': 1 });
CollegeSchema.index({ rating: -1 });
CollegeSchema.index({ nirfRanking: 1 });

// Full text search on name, shortDescription, location, city
CollegeSchema.index(
  {
    name: 'text',
    shortDescription: 'text',
    'location.city': 'text',
    'location.state': 'text',
  },
  {
    weights: {
      name: 10,
      shortDescription: 5,
      'location.city': 2,
      'location.state': 1,
    },
    name: 'CollegeTextIndex',
  }
);

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const College: Model<ICollegeDocument> = mongoose.model<ICollegeDocument>('College', CollegeSchema);

export default College;
