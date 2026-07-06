import mongoose, { Document, Schema, Model } from 'mongoose';
import { ROLES, UserRole } from '../constants/roles';

// ────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────

export interface IUserPreferences {
  interestedFields: string[];
  preferredLocations: string[];
  budgetRange: { min: number; max: number };
  notifications: boolean;
}

export interface ISearchHistoryEntry {
  query: string;
  timestamp: Date;
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  field?: string;
  bio?: string;
  city?: string;
  state?: string;
  dateOfBirth?: Date;
  preferences: IUserPreferences;
  recentSearches: ISearchHistoryEntry[];
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    interestedFields: {
      type: [String],
      default: [],
    },
    preferredLocations: {
      type: [String],
      default: [],
    },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000000 },
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const SearchHistorySchema = new Schema<ISearchHistoryEntry>(
  {
    query: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },

    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address.',
      ],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number.'],
    },

    // Never returned by default — use .select('+password') when needed
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: `Role must be one of: ${Object.values(ROLES).join(', ')}`,
      },
      default: ROLES.USER,
    },

    avatar: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      default: '',
      trim: true,
    },

    city: {
      type: String,
      default: '',
      trim: true,
    },

    state: {
      type: String,
      default: '',
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    field: {
      type: String,
      trim: true,
      enum: [
        'engineering', 'medical', 'business', 'arts',
        'science', 'law', 'design', 'commerce', 'other', '',
      ],
    },

    preferences: {
      type: UserPreferencesSchema,
      default: () => ({
        interestedFields: [],
        preferredLocations: [],
        budgetRange: { min: 0, max: 10000000 },
        notifications: true,
      }),
    },

    recentSearches: {
      type: [SearchHistorySchema],
      default: [],
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    // Password reset — never returned by default
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,                  // Adds createdAt and updatedAt
    versionKey: false,                 // Removes __v field
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // Never expose sensitive fields in JSON output
        const output = ret as any;
        delete output.password;
        delete output.passwordResetToken;
        delete output.passwordResetExpires;
        return output;
      },
    },
    toObject: { virtuals: true },
  }
);

// ────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// ────────────────────────────────────────────────────────────
// Virtuals
// ────────────────────────────────────────────────────────────

UserSchema.virtual('id').get(function (this: IUserDocument) {
  return this._id.toHexString();
});

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);

export default User;
