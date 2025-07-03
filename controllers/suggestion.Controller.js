import Activity from '../models/Activity.model.js';

export const getAllSuggestion = async (req, res) => {
  try {
    const { mood } = req.query; 
    let filter = {};
    if (mood) {
      filter.moods = mood;  
    }
    const activities = await Activity.find(filter).select('name suggestion description image');
    res.status(200).json({
      success: true,
      message: "Activities fetched successfully!",
      activities,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};
