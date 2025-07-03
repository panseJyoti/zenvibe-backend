import User from '../models/user.model.js';
import MoodLog from '../models/MoodLog.model.js';
import Activity from '../models/Activity.model.js';

// Get user
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select(
      'username email role verified bio gender dob location contact skills socialLinks profileImage createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

//  Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const adminId = req.user._id;
    const users = await User.find({ _id: { $ne: adminId }, role: 'user' }).select('username email role verified bio gender dob location skills socialLinks profileImage contact createdAt'); 
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const getUserMoodLogs = async (req, res) => {
  try {
    const userId = req.params.userId;

    const moodLogs = await MoodLog.find({ user: userId })
      .populate({ path: 'user', select: 'username' })
      .populate({ path: 'mood', select: 'name' })
      .sort({ createdAt: -1 });

    const enrichedLogs = await Promise.all(
      moodLogs.map(async (log) => {
        let suggestions = [];
        let deletedSuggestions = [];

        if (log.mood && log.mood._id) {
          const allSuggestions = await Activity.find({ moods: log.mood._id })
            .select('name suggestion description image isDeleted');

          suggestions = allSuggestions.filter(a => !a.isDeleted);
          deletedSuggestions = allSuggestions.filter(a => a.isDeleted);
        }

        return {
          _id: log._id,
          note: log.note,
          createdAt: log.createdAt,
          user: log.user,
          mood: log.mood,
          suggestions,
          deletedSuggestions
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Mood logs with user, mood & related suggestions",
      data: enrichedLogs
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching enriched mood logs",
      error: err.message
    });
  }
};
