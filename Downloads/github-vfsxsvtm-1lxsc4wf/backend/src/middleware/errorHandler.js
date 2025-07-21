const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors,
      },
    });
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_ENTRY",
        message: "Resource already exists",
        details: err.errors.map((error) => ({
          field: error.path,
          message: error.message,
        })),
      },
    });
  }

  // Sequelize foreign key constraint errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "FOREIGN_KEY_ERROR",
        message: "Referenced resource does not exist",
      },
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Internal server error",
    },
  });
};

module.exports = errorHandler;
