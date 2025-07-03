import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mood',
    required: true,
  },
   activity: { // <-- optional, only used in AI suggestions
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
  },
  note: {
    type: String,
    trim: true,
  },
},{ timestamps: true });

const MoodLog = mongoose.model('MoodLog', moodLogSchema);

export default MoodLog;
