const { Sequelize } = require("sequelize");

// ⚠️ Nhớ thay 'your_password' bằng mật khẩu thật của bạn
const sequelize = new Sequelize(
  "todo_app", // DB name
  "root",     // DB user
  "minh152005minh", // ⚠️ Thay bằng mật khẩu thật hoặc để "" nếu không có mật khẩu
  {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
    logging: false, // Tắt log để giảm noise
    pool: {
      max: 10, // Tăng số connection tối đa
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    },
    define: {
      timestamps: true,
      underscored: true, // Sử dụng snake_case cho column names
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    // Thêm options để tránh lỗi "Too many keys"
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    },
  }
);

// ✅ Kiểm tra kết nối
sequelize.authenticate()
  .then(() => {
    console.log("✅ Kết nối DB thành công!");
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối DB:", err.message);
  });

module.exports = sequelize;
