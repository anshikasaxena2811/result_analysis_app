import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createError } from '../utils/error.js';

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, admissionYear, program } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return next(createError(400, 'Please provide all required fields'));
    }

    // validate required fields for student
    if (role === 'student' && (!admissionYear || !program)) {
      return next(createError(400, 'Please provide all required fields'));
    }


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(400, 'User already exists'));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      admissionYear,
      program
    });

    // Save user
    const savedUser = await newUser.save();

    // Create token
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser._doc;

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    // Validate email and password are provided
    if (!email || !password) {
      return next(createError(400, 'Please provide email and password'))
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return next(createError(404, 'User not found'))
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return next(createError(400, 'Invalid credentials'))
    }

    // Create token - Let's add console.logs to check the payload
    const tokenPayload = { id: user._id, role: user.role };
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Verify token contents
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add token to user's tokens array with device info
    const device = req.headers['user-agent'] || 'unknown device';
    await user.addToken(token, device);

    // Update last login timestamp
    await user.updateLastLogin();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })

    res.status(200).json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    next(error)
  }
}

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, ...updateFields } = req.body;
    const userId = req.user.id;

    // Get user
    const user = await User.findById(userId);

    // If updating email, check if new email already exists
    if (updateFields.email && updateFields.email !== user.email) {
      const emailExists = await User.findOne({ email: updateFields.email });
      if (emailExists) {
        return next(createError(400, 'Email already in use'));
      }
    }

    // Update only the fields that are present in the request
    Object.keys(updateFields).forEach(field => {
      if (updateFields[field] !== undefined) {
        user[field] = updateFields[field];
      }
    });

    // Save updates
    const updatedUser = await user.save();
    const { password: _, ...userWithoutPassword } = updatedUser._doc;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Separate password change function
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return next(createError(400, 'Please provide both current and new password'));
    }

    const user = await User.findById(userId);

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return next(createError(400, 'Current password is incorrect'));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {

    const token = req.cookies.token
    // If token exists, decode it to check contents and remove it from the user's tokens array
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
        const user  = await User.findByIdAndUpdate(decoded.id);
        await user.removeToken(token);
      } catch (err) {
        console.log('Token decode error:', err);
      }
    }

    // Clear cookie
    res.cookie('token', null, {
      //cookie will expire now
      expires: new Date(Date.now()),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    // Remove all tokens
    await req.user.removeAllTokens();

    // Clear cookie
    res.cookie('token', null, {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getLoginDevices = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const currentToken = req.cookies.token;
    
    // Filter out the current device and map the remaining devices
    const devices = user.tokens
      .filter(token => token.token !== currentToken) // Exclude current device
      .map(token => ({
        id: token._id,
        device: token.device,
        lastUsed: token.lastUsed
      }));

    res.status(200).json({
      success: true,
      devices
    });
  } catch (error) {
    next(error);
  }
};

export const removeDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const user = await User.findById(req.user._id);
    const currentToken = req.cookies.token;
    
    // Find the token document
    const tokenDoc = user.tokens.id(deviceId);
    if (!tokenDoc) {
      return next(createError(404, 'Device not found'));
    }

    // Prevent removing current device through this endpoint
    if (tokenDoc.token === currentToken) {
      return next(createError(400, 'Cannot remove current device. Use logout instead.'));
    }

    // Remove the specific token
    await user.removeToken(tokenDoc.token);

    res.status(200).json({
      success: true,
      message: 'Device removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const removeAllDevices = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    await user.removeAllTokens();

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
}; 