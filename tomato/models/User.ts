import mongoose, { Schema, Model } from 'mongoose';

// Interface for user document properties
export interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  dob: Date;
}

// Check if model already exists to prevent re-compilation
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode: {
    type: String,
  },
  dob: {
    type: Date,
  },

}, { timestamps: true }); // `timestamps` adds createdAt and updatedAt fields

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;