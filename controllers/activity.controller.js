import mongoose from 'mongoose';
import Activity from '../models/Activity.model.js';

export const deleteActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid activity ID' });
    }

    const updated = await Activity.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'Activity not found' });
    }

    res.status(200).json({ msg: 'Activity soft-deleted successfully', activity: updated });

  } catch (err) {
    res.status(500).json({ msg: 'Failed to soft delete activity', error: err.message });
  }
};


export const getSingleActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate('moods');
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });

    res.status(200).json({ activity });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export const updateActivity = async (req, res) => {
  try {
    const activityId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({ msg: 'Invalid activity ID' });
    }

    const { name, suggestion, description, moods } = req.body;
    const moodArray = typeof moods === 'string' ? JSON.parse(moods) : moods;

    const updateData = {
      name,
      suggestion,
      description
    };

    // Handle image update
    if (req.file) {
      updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Handle mood update
    if (moodArray && Array.isArray(moodArray)) {
      updateData.moods = moodArray.map(moodId => new mongoose.Types.ObjectId(moodId));
    }

    const updatedActivity = await Activity.findByIdAndUpdate(activityId, updateData, {
      new: true
    }).populate('moods');

    if (!updatedActivity) {
      return res.status(404).json({ msg: 'Activity not found' });
    }

    res.status(200).json({ msg: 'Activity updated successfully', activity: updatedActivity });

  } catch (err) {
    res.status(500).json({ msg: 'Failed to update activity', error: err.message });
  }
};


export const createActivity = async (req, res) => {
  try {
    const { name, suggestion, description, moods } = req.body;

    if (!moods || moods.length === 0) {
      return res.status(400).json({ msg: 'At least one mood is required' });
    }

    const moodArray = typeof moods === 'string' ? JSON.parse(moods) : moods;
    const moodObjectIds = moodArray.map(mood => new mongoose.Types.ObjectId(mood));

    let imagePath = '';
    if (req.file) {
      imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    let activity = await Activity.findOne({ name });
    if (activity) {
      const existingMoods = activity.moods.map(m => m.toString());
      const newUniqueMoods = moodObjectIds.filter(id => !existingMoods.includes(id.toString()));
      if (newUniqueMoods.length > 0) {
        activity.moods = [...new Set([...activity.moods, ...newUniqueMoods])];
        await activity.save();
        return res.status(200).json({ msg: 'Activity updated with new moods', activity });
      }
      return res.status(200).json({ msg: 'No new moods to add', activity });
    }

    activity = new Activity({
      name,
      suggestion,
      description,
      image: imagePath,
      moods: moodObjectIds,
    });

    await activity.save();
    res.status(201).json({ msg: 'Activity created successfully', activity });

  } catch (err) {
    res.status(500).json({ msg: 'Activity creation failed', error: err.message });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isDeleted: false }).populate('moods');
    res.status(200).json({ activities });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch activities', error: err.message });
  }
};
