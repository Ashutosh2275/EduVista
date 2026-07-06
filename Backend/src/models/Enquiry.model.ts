import mongoose, { Document, Schema, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────

export interface IEnquiry {
  name: string;
  email: string;
  phone: string;
  interestedCourse: string;
  college?: mongoose.Types.ObjectId; // Optional reference to College
  message: string;
  status: 'new' | 'contacted' | 'in-progress' | 'closed';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnquiryDocument extends IEnquiry, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────

const EnquirySchema = new Schema<IEnquiryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Student name is required.'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },

    email: {
      type: String,
      required: [true, 'Email address is required.'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number.'],
    },

    interestedCourse: {
      type: String,
      required: [true, 'Interested course is required.'],
      trim: true,
    },

    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      default: null,
    },

    message: {
      type: String,
      required: [true, 'Message text is required.'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters.'],
    },

    status: {
      type: String,
      enum: ['new', 'contacted', 'in-progress', 'closed'],
      default: 'new',
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },
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

EnquirySchema.index({ status: 1 });
EnquirySchema.index({ createdAt: -1 });
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ college: 1 });

// Full text search index
EnquirySchema.index(
  {
    name: 'text',
    email: 'text',
    phone: 'text',
    interestedCourse: 'text',
  },
  {
    weights: {
      name: 10,
      email: 5,
      phone: 5,
      interestedCourse: 2,
    },
    name: 'EnquiryTextIndex',
  }
);

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const Enquiry: Model<IEnquiryDocument> = mongoose.model<IEnquiryDocument>('Enquiry', EnquirySchema);

export default Enquiry;
