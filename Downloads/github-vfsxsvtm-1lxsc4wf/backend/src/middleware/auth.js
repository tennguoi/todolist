const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NO_TOKEN",
          message: "Access token required",
        },
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
    );
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid access token",
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Access token has expired",
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_ERROR",
        message: "Token verification failed",
      },
    });
  }
};

module.exports = { authenticateToken };
