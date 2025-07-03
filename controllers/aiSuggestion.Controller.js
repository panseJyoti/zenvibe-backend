import axios from 'axios';
import Mood from '../models/Mood.model.js';
import Activity from '../models/Activity.model.js';
import MoodLog from '../models/MoodLog.model.js';

export const suggestActivityBasedOnMood = async (req, res) => {
  const { mood, note } = req.body;
  const userId = req.user?._id;

  if (!mood) {
    return res.status(400).json({ success: false, message: "Mood is required" });
  }

  const prompt = `
You are a helpful mental wellness assistant.

A user is feeling "${mood}". Based on this mood, suggest one helpful activity they can do. 
Give the response in this JSON format (no markdown):

{
  "suggestion": "<activity name>",
  "description": "<brief description of why it's helpful for this mood>"
}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    let aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const cleanedText = aiText.replace(/```json|```/g, '').trim();

    let suggestionObj = JSON.parse(cleanedText);
    const moodName = mood.toLowerCase();

    let moodDoc = await Mood.findOne({ name: { $regex: new RegExp(`^${moodName}$`, 'i') } });

    if (moodDoc && moodDoc.isDeleted) {
      moodDoc = new Mood({ name: moodName });
      await moodDoc.save();
    }

    if (!moodDoc) {
      moodDoc = new Mood({ name: moodName });
      await moodDoc.save();
    }

    const activity = new Activity({
      name: suggestionObj.suggestion,
      suggestion: suggestionObj.suggestion,
      description: suggestionObj.description,
      moods: [moodDoc._id],
      isAI: true,
      createdBy: userId
    });
    await activity.save();

    const moodLog = new MoodLog({
      user: userId,
      mood: moodDoc._id,
      activity: activity._id,
      note: note 
    });
    await moodLog.save();

    return res.status(201).json({
      success: true,
      mood: moodDoc,
      suggestion: suggestionObj,
      activity,
      moodLog
    });

  } catch (err) {
    console.error('AI Suggestion Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get or save AI suggestion' });
  }
};
