import MoodLog from '../models/MoodLog.model.js';
import Activity from '../models/Activity.model.js';
import Mood from '../models/Mood.model.js';

export const getMoodLogsByDate = async (req, res) => {
  try {
    const userId = req.user._id;

    const moodLogs = await MoodLog.find({ user: userId })
      .populate("mood", "name")
      .sort({ createdAt: -1 });

    const moodMap = {};

    for (let log of moodLogs) {
      if (!log.createdAt || isNaN(new Date(log.createdAt))) continue;

      const date = new Date(log.createdAt);

      // ✅ Convert to India format YYYY-MM-DD without shifting date
      const [day, month, year] = date.toLocaleDateString('en-IN').split('/');
      const dateKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      if (!moodMap[dateKey]) moodMap[dateKey] = [];

      moodMap[dateKey].push({
        mood: log.mood?.name || "Unknown",
        note: log.note || "",
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      });
    }

    res.status(200).json(moodMap);

  } catch (error) {
    console.error("Error in getMoodLogsByDate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getAllMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ moods });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch moods', error: err.message });
  }
};


export const getMoodAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await MoodLog.aggregate([
      { $match: { user: userId } },

      // Join mood
      {
        $lookup: {
          from: 'moods',
          localField: 'mood',
          foreignField: '_id',
          as: 'moodDetails'
        }
      },
      { $unwind: '$moodDetails' },

      // Group by week and mood name
      {
        $group: {
          _id: {
            week: { $isoWeek: '$createdAt' },
            mood: '$moodDetails.name'
          },
          count: { $sum: 1 }
        }
      },

      // Group by week and push moods in array
      {
        $group: {
          _id: '$_id.week',
          moods: {
            $push: {
              mood: '$_id.mood',
              count: '$count'
            }
          }
        }
      },

      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      message: 'Mood analytics fetched successfully!',
      analytics
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while fetching mood analytics' });
  }
};

export const getMoodHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Find mood logs and populate mood (even soft-deleted)
    const moodLogs = await MoodLog.find({ user: userId })
      .populate({
        path: 'mood',
        select: 'name isDeleted',
        options: { lean: true }
      })
      .sort({ createdAt: -1 });

    // Step 2: Filter mood logs: ignore permanently deleted moods (null)
    const moodHistory = await Promise.all(
      moodLogs
        .filter(log => log.mood !== null) // skip permanent deletions
        .map(async (log) => {
          const moodName = log.mood.name + (log.mood.isDeleted ? ' (Deleted)' : '');

          // Step 3: Fetch only activities that are not permanently deleted
          const suggestions = await Activity.find({
            moods: log.mood._id,
            isDeleted: false // ✅ only active or soft-deleted
          }).select('name suggestion description image isAI');

          return {
            _id: log._id,
            mood: moodName,
            note: log.note,
            createdAt: log.createdAt,
            suggestions: suggestions.map((s) => ({
              name: s.name,
              suggestion: s.suggestion,
              description: s.description,
              image: s.image,
              isAI: s.isAI || false
            }))
          };
        })
    );

    // Step 4: Respond
    res.status(200).json({
      message: 'Mood history fetched successfully!',
      moodHistory
    });

  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const logMoodAndGetSuggestions = async (req, res) => {
  try {
    const { moodId, note } = req.body;
    const userId = req.user._id;

    if (!moodId) {
      return res.status(400).json({ message: 'Mood ID is required' });
    }

    // Mood check
    const mood = await Mood.findOne({ _id: moodId, isDeleted: false });
    if (!mood) {
      return res.status(404).json({ message: 'Mood not found or has been deleted' });
    }

    // Manual Suggestions Check
    const suggestions = await Activity.find({ moods: mood._id }).select('name suggestion description image');

    if (!suggestions || suggestions.length === 0) {
      //  No manual suggestion — don't log mood
      return res.status(200).json({
        message: 'No suggestions available for this mood. Try AI suggestions instead.',
        redirectToAI: true,
        moodName: mood.name,
        moodId: mood._id
      });
    }

    // Suggestions found — log mood
    let moodLog = await MoodLog.create({
      user: userId,
      mood: mood._id,
      note
    });

    moodLog = await MoodLog.findById(moodLog._id)
      .populate('user', 'name')
      .populate('mood', 'name');

    res.status(201).json({
      message: 'Mood logged successfully!',
      moodLog,
      suggestions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
