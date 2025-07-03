import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
     lowercase: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Mood = mongoose.model('Mood', moodSchema);
export default Mood;
