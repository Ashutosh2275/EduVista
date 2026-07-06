import mongoose, { Document, Schema, Model } from 'mongoose';
import { CONTACT_INFO } from '../constants/contactInfo';

// ────────────────────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────────────────────

export interface IGeneralSettings {
  platformName: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
}

export interface ISEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface IContactInformation {
  supportEmail: string;
  supportPhone: string;
  address?: string;
}

export interface ISystemSettings {
  key: string; // e.g. 'platform_settings'
  general: IGeneralSettings;
  seo: ISEOSettings;
  contact: IContactInformation;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISystemSettingsDocument extends ISystemSettings, Document {
  _id: mongoose.Types.ObjectId;
}

// ────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────

const GeneralSettingsSchema = new Schema<IGeneralSettings>(
  {
    platformName: { type: String, default: 'EduVista', trim: true },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
  },
  { _id: false }
);

const SEOSettingsSchema = new Schema<ISEOSettings>(
  {
    metaTitle: { type: String, default: 'EduVista — Find Top Colleges & Courses', trim: true },
    metaDescription: { type: String, default: 'Discover top educational institutions, streams, admission dates, and placement packages.', trim: true },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const ContactInformationSchema = new Schema<IContactInformation>(
  {
    supportEmail: { type: String, default: CONTACT_INFO.email, trim: true },
    supportPhone: { type: String, default: CONTACT_INFO.phone, trim: true },
    address: { type: String, default: CONTACT_INFO.location, trim: true },
  },
  { _id: false }
);

const SystemSettingsSchema = new Schema<ISystemSettingsDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'platform_settings',
    },

    general: { type: GeneralSettingsSchema, default: () => ({}) },
    seo: { type: SEOSettingsSchema, default: () => ({}) },
    contact: { type: ContactInformationSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────

const SystemSettings: Model<ISystemSettingsDocument> = mongoose.model<ISystemSettingsDocument>(
  'SystemSettings',
  SystemSettingsSchema
);

export default SystemSettings;
