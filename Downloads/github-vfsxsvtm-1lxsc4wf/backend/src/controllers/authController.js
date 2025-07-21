// File: authController.js (đã sửa)
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const {
  User,
  FocusSettings,
  NotificationSettings,
  ThemeSettings,
} = require("../models");

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const createDefaultSettings = async (userId) => {
  try {
    await Promise.all([
      FocusSettings.create({ user_id: userId }),
      NotificationSettings.create({ user_id: userId }),
      ThemeSettings.create({ user_id: userId }),
    ]);
  } catch (error) {
    console.error("Error creating default settings:", error);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Email and password are required",
        },
      });
    }

    // Tìm user với password_hash để có thể validate
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    // Kiểm tra password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: "Sign in successful",
    });
  } catch (error) {
    console.error("SignIn Error:", error);
    return next(error);
  }
};

const signUp = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Email, password, and name are required",
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: "WEAK_PASSWORD",
          message: "Password must be at least 6 characters long",
        },
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: "USER_EXISTS",
          message: "User with this email already exists",
        },
      });
    }

    const user = await User.create({
      email,
      password_hash: password, // Model sẽ tự động hash password
      name,
    });

    await createDefaultSettings(user.id);

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return next(error);
  }
};

const signInWithGoogle = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar, idToken } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Google ID, email, and name are required",
        },
      });
    }

    // Tìm user theo google_id hoặc email
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { google_id: googleId },
          { email: email }
        ]
      }
    });

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = await User.create({
        email,
        name,
        google_id: googleId,
        avatar,
      });

      await createDefaultSettings(user.id);
    } else if (!user.google_id) {
      // Nếu user tồn tại nhưng chưa có google_id, cập nhật
      await user.update({ google_id: googleId, avatar });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: "Google sign in successful",
    });
  } catch (error) {
    console.error("Google SignIn Error:", error);
    return next(error);
  }
};

const signOut = async (req, res, next) => {
  try {
    console.log("Processing signout request");

    // Try to get user info from token if provided
    const authHeader = req.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key-change-in-production");
        userId = decoded.userId;
        console.log(`User ${userId} signing out`);
      } catch (tokenError) {
        console.log("Signing out with invalid/expired token - this is okay");
      }
    } else {
      console.log("Signing out without token - this is okay");
    }

    // In a production app, you might want to:
    // 1. Add the token to a blacklist/revoked tokens list
    // 2. Clear any server-side sessions
    // 3. Log the signout event for security purposes
    
    if (userId) {
      // Update last_login or add signout timestamp if needed
      try {
        const user = await User.findByPk(userId);
        if (user) {
          console.log(`Successfully signed out user: ${user.email}`);
        }
      } catch (userError) {
        console.log("Could not find user for signout logging, but continuing");
      }
    }

    return res.json({
      success: true,
      message: "Sign out successful",
    });
  } catch (error) {
    console.error("SignOut Error:", error);
    // Even if there's an error, return success for signout
    // The client should clear local storage regardless
    return res.json({
      success: true,
      message: "Sign out completed (with errors)",
    });
  }
};

module.exports = {
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
};
