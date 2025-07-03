import mongoose from 'mongoose';
import Mood from '../models/Mood.model.js';
import Activity from '../models/Activity.model.js';

//Delete mood
export const deleteMood = async (req, res) => {
  try {
    const moodId = req.params.moodId;
    if (!mongoose.Types.ObjectId.isValid(moodId)) {
      return res.status(400).json({ msg: 'Invalid Mood ID format' });
    }

    const mood = await Mood.findById(moodId);
    if (!mood) {
      return res.status(404).json({ msg: 'Mood not found' });
    }

    mood.isDeleted = true;
    await mood.save();

    // Remove this mood from all related activities
    await Activity.updateMany(
      { moods: moodId },
      { $pull: { moods: moodId } }
    );

    res.status(200).json({
      msg: 'Mood soft deleted and removed from activities',
      mood
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error deleting mood', error: error.message });
  }
};


// Create Mood 
export const createMood = async (req, res) => {
  let { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Mood name is required' });
  }

  const normalizedName = name.trim();

  try {
    // Case-insensitive check using regex
    const existingMood = await Mood.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
    });

    if (existingMood && !existingMood.isDeleted) {
      return res.status(400).json({ msg: 'Mood already exists' });
    }

    if (existingMood && existingMood.isDeleted) {
      existingMood.isDeleted = false;
      existingMood.description = description;
      await existingMood.save();
      return res.status(200).json({ msg: 'Mood restored successfully', mood: existingMood });
    }

    // Save with original case (e.g., Happy, HappyMood etc.)
    const newMood = await Mood.create({ name: normalizedName, description });
    res.status(201).json({ msg: 'Mood created successfully', mood: newMood });

  } catch (err) {
    res.status(500).json({ msg: 'Error creating mood', error: err.message });
  }
};



// Get All Moods 
export const getAllMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ moods });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch moods', error: err.message });
  }
};

//Restore Moods
export const restoreMood = async (req, res) => {
  try {
    const moodId = req.params.moodId;
    const mood = await Mood.findById(moodId);
    if (!mood) return res.status(404).json({ msg: 'Mood not found' });

    mood.isDeleted = false;
    await mood.save();

    res.status(200).json({ msg: 'Mood restored successfully', mood });
  } catch (err) {
    res.status(500).json({ msg: 'Error restoring mood', error: err.message });
  }
};

