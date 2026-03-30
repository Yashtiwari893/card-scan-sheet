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
  remark?: string;
  meetingTime?: Date;
  meetingScheduled?: boolean;
  sentConfirmation?: boolean;
  sent24hReminder?: boolean;
  sent1hReminder?: boolean;
  sentStartMessage?: boolean;
  sentEndMessage?: boolean;
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
  remark: { type: String },
  meetingTime: { type: Date },
  meetingScheduled: { type: Boolean, default: false },
  sentConfirmation: { type: Boolean, default: false },
  sent24hReminder: { type: Boolean, default: false },
  sent1hReminder: { type: Boolean, default: false },
  sentStartMessage: { type: Boolean, default: false },
  sentEndMessage: { type: Boolean, default: false },
  scannedAt: { type: Date, default: Date.now }
});

export default models.Contact || model<IContact>('Contact', ContactSchema);
