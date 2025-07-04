
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/elastic');
const { SportModel } = require('../models/elastic');
const { AchievementModel } = require('../models/elastic');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await UserModel.findByEmail(email);

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await UserModel.createUser({
      name,
      email,
      password,
      isAdmin: false,
      favoritesSports: [],
      achievements: []
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await UserModel.findByEmail(email);

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);

    if (user) {
      // Fetch favorite sports
      const favoritesSports = [];
      if (user.favoritesSports && user.favoritesSports.length > 0) {
        for (const sportId of user.favoritesSports) {
          const sport = await SportModel.getSportById(sportId);
          if (sport) {
            favoritesSports.push(sport);
          }
        }
      }

      // Fetch achievements
      const achievements = [];
      if (user.achievements && user.achievements.length > 0) {
        for (const achievementId of user.achievements) {
          const achievement = await AchievementModel.getAchievementById(achievementId);
          if (achievement) {
            achievements.push(achievement);
          }
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        favoritesSports,
        achievements,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);

    if (user) {
      const updatedUser = await UserModel.updateUser(user._id, {
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        password: req.body.password,
        favoritesSports: req.body.favoritesSports || user.favoritesSports
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        favoritesSports: updatedUser.favoritesSports,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
