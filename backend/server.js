require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");

const PORT = process.env.PORT || 3000;

// Test database connection and sync models
const startServer = async () => {
  try {
    console.log("Starting server...");

    // Test database connection
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established successfully.");

      // Sync database models (create tables if they don't exist)
      await sequelize.sync({ alter: true, force: false });
      console.log("✅ Database models synchronized.");
    } catch (dbError) {
      console.warn(
        "⚠️ Database connection failed, but server will continue:",
        dbError.message,
      );
      console.log("ℹ️ Server will run without database functionality");
      console.log("💡 To fix database issues:");
      console.log("   1. Make sure MySQL is running");
      console.log("   2. Check database credentials in backend/src/config/database.js");
      console.log("   3. Create database 'todo_app' if it doesn't exist");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
