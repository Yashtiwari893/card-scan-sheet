import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name?: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  linkedin?: string;
  rawText?: string;
  imageUrl?: string;
  scannedAt: Date;
}

const ContactSchema = new Schema<IContact>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String },
  company: { type: String },
  jobTitle: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  address: { type: String },
  linkedin: { type: String },
  rawText: { type: String },
  imageUrl: { type: String },
  scannedAt: { type: Date, default: Date.now }
});

export default models.Contact || model<IContact>('Contact', ContactSchema);
