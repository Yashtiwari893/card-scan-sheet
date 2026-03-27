import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
  waPhone: string;
  name?: string;
  email?: string;
  timezone?: string;
  googleSheets?: {
    accessToken?: string;
    refreshToken?: string;
    sheetId?: string;
    connected: boolean;
  };
  googleCalendar?: {
    accessToken?: string;
    refreshToken?: string;
    connected: boolean;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  waPhone: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  timezone: { type: String, default: 'Asia/Kolkata' },
  googleSheets: {
    accessToken: { type: String },
    refreshToken: { type: String },
    sheetId: { type: String },
    connected: { type: Boolean, default: false }
  },
  googleCalendar: {
    accessToken: { type: String },
    refreshToken: { type: String },
    connected: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

export default models.User || model<IUser>('User', UserSchema);
