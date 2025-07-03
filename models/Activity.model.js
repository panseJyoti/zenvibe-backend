import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  suggestion: {
    type: String,
    required: true
  },
  description: String,
  image: {
    type: String,
    required: false
  },
  moods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mood',
    required: true
  }],
  isAI: { 
    type: Boolean, 
    default: false 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
