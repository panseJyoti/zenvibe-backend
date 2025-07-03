import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    default: ''
  },
  contact: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined  
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: '',
  },

  dob: {
    type: Date,
    default: ''
  },

  location: {
    type: String,
    default: ''
  },

  skills: {
    type: [String],
    default: []
  },
  socialLinks: {
    linkedin: String,
    github: String,
    facebook: String,
    twitter: String,
    instagram: String
  },
  profileImage: {
    type: String,
    default: ''
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiration: {
    type: Date,
    default: null
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
