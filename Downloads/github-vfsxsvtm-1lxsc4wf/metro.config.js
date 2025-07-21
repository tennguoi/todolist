const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Allow requests from Tempo development environment
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      // Set CORS headers for Tempo
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");

      if (req.method === "OPTIONS") {
        res.statusCode = 200;
        res.end();
        return;
      }

      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
