import mongoose, { Document, Schema, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────────────────────

export interface IAcademicDetails {
  eligibility?: string;
  entranceExams: string[];
  minimumQualification?: string;
}

export interface ICourseFees {
  tuitionFees: number;
  hostelFees: number;
  otherCharges: number;
}

export interface ICoursePlacement {
  averagePackage: number;
  highestPackage: number;
  placementRate: number;
}

export interface ICourseSEO {
  metaTitle?: string;
  metaDescription?: string;
}

export interface ICourse {
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  degreeLevel: 'UG' | 'PG' | 'Diploma' | 'PhD';
  stream: 'engineering' | 'medical' | 'management' | 'commerce' | 'law' | 'design' | 'science' | 'arts' | 'other';
  specialization: string[];
  duration: string; // e.g. '4 years', '2 years'
  mode: 'full-time' | 'part-time' | 'online';
  language: string;
  
  academics: IAcademicDetails;
  fees: ICourseFees;
  placement: ICoursePlacement;
  
  rating: number;
  reviewCount: number;
  numberOfCollegesOffering: number;
  
  collegesOffering: mongoose.Types.ObjectId[]; // Many-to-Many back reference to College model
  
  seo: ICourseSEO;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isTrending: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseDocument extends ICourse, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────

const AcademicDetailsSchema = new Schema<IAcademicDetails>(
  {
    eligibility: { type: String, trim: true },
    entranceExams: { type: [String], default: [] },
    minimumQualification: { type: String, trim: true },
  },
  { _id: false }
);

const CourseFeesSchema = new Schema<ICourseFees>(
  {
    tuitionFees: { type: Number, default: 0 },
    hostelFees: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
  },
  { _id: false }
);

const CoursePlacementSchema = new Schema<ICoursePlacement>(
  {
    averagePackage: { type: Number, default: 0 },
    highestPackage: { type: Number, default: 0 },
    placementRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const CourseSEOSchema = new Schema<ICourseSEO>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
  },
  { _id: false }
);

const CourseSchema = new Schema<ICourseDocument>(
  {
    name: {
      type: String,
      required: [true, 'Course name is required.'],
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
    
    shortDescription: { type: String, trim: true },
    fullDescription: { type: String, trim: true },
    
    degreeLevel: {
      type: String,
      enum: ['UG', 'PG', 'Diploma', 'PhD'],
      required: [true, 'Degree level (UG/PG/Diploma/PhD) is required.'],
    },
    
    stream: {
      type: String,
      enum: ['engineering', 'medical', 'management', 'commerce', 'law', 'design', 'science', 'arts', 'other'],
      required: [true, 'Course stream is required.'],
    },
    
    specialization: { type: [String], default: [] },
    duration: { type: String, required: [true, 'Course duration is required.'] },
    
    mode: {
      type: String,
      enum: ['full-time', 'part-time', 'online'],
      required: [true, 'Course mode (full-time/part-time/online) is required.'],
    },
    
    language: { type: String, default: 'English', trim: true },
    
    academics: { type: AcademicDetailsSchema, default: () => ({ entranceExams: [] }) },
    fees: { type: CourseFeesSchema, default: () => ({ tuitionFees: 0, hostelFees: 0, otherCharges: 0 }) },
    placement: { type: CoursePlacementSchema, default: () => ({ averagePackage: 0, highestPackage: 0, placementRate: 0 }) },
    
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    numberOfCollegesOffering: { type: Number, default: 0 },
    
    collegesOffering: [
      {
        type: Schema.Types.ObjectId,
        ref: 'College',
      },
    ],
    
    seo: { type: CourseSEOSchema, default: () => ({}) },
    
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

CourseSchema.index({ slug: 1 }, { unique: true });
CourseSchema.index({ status: 1 });
CourseSchema.index({ stream: 1 });
CourseSchema.index({ degreeLevel: 1 });
CourseSchema.index({ mode: 1 });
CourseSchema.index({ isFeatured: 1 });
CourseSchema.index({ isTrending: 1 });
CourseSchema.index({ rating: -1 });
CourseSchema.index({ 'fees.tuitionFees': 1 });
CourseSchema.index({ collegesOffering: 1 }); // Performance index for many-to-many relationship

// Full text search on name, shortDescription, specialization
CourseSchema.index(
  {
    name: 'text',
    shortDescription: 'text',
    specialization: 'text',
  },
  {
    weights: {
      name: 10,
      shortDescription: 5,
      specialization: 2,
    },
    name: 'CourseTextIndex',
  }
);

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const Course: Model<ICourseDocument> = mongoose.model<ICourseDocument>('Course', CourseSchema);

export default Course;
