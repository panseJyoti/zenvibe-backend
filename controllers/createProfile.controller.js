import User from '../models/user.model.js';

// View Profile 
export const viewProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('username email bio gender dob location contact skills profileImage socialLinks');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Delete Profile (Clear Info)
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.bio = '';
    user.gender = '';
    user.dob = '';
    user.location = '';
    user.contact = '';
    user.skills = [];
    user.socialLinks = {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      facebook: ''
    };

    await user.save();
    res.status(200).json({ msg: "Profile cleared successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error clearing profile", error: error.message });
  }
};

// Upload Profile Image
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    user.profileImage = req.file.filename;
    await user.save();
    res.status(200).json({ message: 'Profile image uploaded successfully', imageUrl: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Create or Update Profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Received body:", req.body);

    const { bio, gender, dob, contact, location, skills, socialLinks } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    console.log("Updating profile for user:", userId);

    user.bio = bio ?? user.bio;
    user.gender = gender ?? user.gender;
    user.dob = dob ? new Date(dob) : user.dob;
    user.location = location ?? user.location;
    user.contact = contact ?? user.contact;
    user.skills = typeof skills === "string" ? skills.split(",").map(s => s.trim()) : skills ?? user.skills;
    user.socialLinks = typeof socialLinks === "object" ? socialLinks : user.socialLinks;

    console.log("New user data:", {
      bio: user.bio,
      gender: user.gender,
      dob: user.dob,
      contact: user.contact,
      location: user.location,
      skills: user.skills,
      socialLinks: user.socialLinks,
    });

    await user.save();

    res.status(200).json({
      msg: "Profile saved successfully",
      user,
    });
  } catch (err) {
    console.error("Error in createOrUpdateProfile:", err);
    res.status(500).json({ msg: "Error saving profile", error: err.message });
  }
};
