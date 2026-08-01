const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { User, Officer, Analyst, Location } = require('../models');

const normalizeProfileDetails = (profile) => {
  if (!profile) return profile;
  const normalized = profile.toJSON ? profile.toJSON() : { ...profile };
  normalized._id = normalized.id;
  return normalized;
};

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    // Check for user (find by email or name)
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: usernameOrEmail.toLowerCase() },
          { name: usernameOrEmail },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Get additional info if officer or analyst
    let extraDetails = null;
    if (user.role === 'officer') {
      extraDetails = await Officer.findOne({
        where: { userId: user.id },
        include: [{ model: Location, as: 'station' }],
      });
    } else if (user.role === 'analyst') {
      extraDetails = await Analyst.findOne({
        where: { userId: user.id },
      });
    }

    extraDetails = normalizeProfileDetails(extraDetails);

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user.id, // Keep _id mapping for frontend compat
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      details: extraDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register a user (Admin-only)
// @route   POST /api/auth/signup
// @access  Private/Admin
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, badgeNo, station, contact, department } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'officer',
    });

    let extraDetails = null;

    // Based on role, create specific profiles
    if (user.role === 'officer') {
      const phoneRegex = /^[789]\d{9}$/;
      if (!badgeNo || !station || !contact) {
        // Rollback user creation
        await User.destroy({ where: { id: user.id } });
        return res.status(400).json({
          success: false,
          message: 'Officer requires badgeNo, station, and contact',
        });
      }
      if (!phoneRegex.test(contact)) {
        await User.destroy({ where: { id: user.id } });
        return res.status(400).json({
          success: false,
          message: 'Contact phone number must be 10 digits starting with 7, 8, or 9.',
        });
      }

      extraDetails = await Officer.create({
        userId: user.id,
        badgeNo,
        stationId: station,
        contact,
      });
    } else if (user.role === 'analyst') {
      if (!department) {
        // Rollback user creation
        await User.destroy({ where: { id: user.id } });
        return res.status(400).json({
          success: false,
          message: 'Analyst requires department',
        });
      }

      extraDetails = await Analyst.create({
        userId: user.id,
        department,
      });
    }

    extraDetails = normalizeProfileDetails(extraDetails);

    res.status(201).json({
      success: true,
      message: `${user.role.toUpperCase()} registered successfully`,
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      details: extraDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Forgot Password - Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Token generated and printed to console / returned in response',
      resetToken,
      resetUrl: `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Hash token from parameter
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Upload profile picture for Officer
// @route   POST /api/auth/profile-picture
// @access  Private/Officer
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid image file' });
    }

    const officer = await Officer.findOne({ where: { userId: req.user.id } });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer profile not found' });
    }

    // Delete old profile picture if exists
    if (officer.profilePicture) {
      const oldPath = path.join(__dirname, '../', officer.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new profile picture path
    officer.profilePicture = `/uploads/${req.file.filename}`;
    await officer.save();

    let populatedOfficer = await Officer.findByPk(officer.id, {
      include: [{ model: Location, as: 'station' }],
    });
    populatedOfficer = normalizeProfileDetails(populatedOfficer);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      details: populatedOfficer,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete profile picture for Officer
// @route   DELETE /api/auth/profile-picture
// @access  Private/Officer
exports.deleteProfilePicture = async (req, res) => {
  try {
    const officer = await Officer.findOne({ where: { userId: req.user.id } });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer profile not found' });
    }

    // Delete file from disk
    if (officer.profilePicture) {
      const filePath = path.join(__dirname, '../', officer.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    officer.profilePicture = '';
    await officer.save();

    let populatedOfficer = await Officer.findByPk(officer.id, {
      include: [{ model: Location, as: 'station' }],
    });
    populatedOfficer = normalizeProfileDetails(populatedOfficer);

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      details: populatedOfficer,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
