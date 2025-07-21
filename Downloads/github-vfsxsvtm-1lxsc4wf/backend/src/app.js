const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// Initialize models first
require("./models");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const projectRoutes = require("./routes/projects");
const focusRoutes = require("./routes/focus");
const userRoutes = require("./routes/users");
const settingsRoutes = require("./routes/settings");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration - Allow all origins in development
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again later.",
    },
  },
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/settings", settingsRoutes);

// Search endpoint
app.get(
  "/api/search/tasks",
  require("./middleware/auth").authenticateToken,
  require("./controllers/taskController").getTasks,
);

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Todo App API Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      tasks: "/api/tasks",
      projects: "/api/projects",
      focus: "/api/focus",
      settings: "/api/settings",
    },
  });
});

// 404 handler - must come before error handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Error handling - must be last
app.use(errorHandler);

module.exports = app;
