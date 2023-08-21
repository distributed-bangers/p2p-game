import { Schema, model } from 'mongoose';
import { IUser } from '../index.js';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  salt:{
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
  },
});

const User = model<IUser>('User', userSchema);

export default User;
