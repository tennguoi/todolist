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
    logging: console.log, // Hiện log truy vấn (có thể tắt nếu cần)
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      createdAt: "created_at",
      updatedAt: "updated_at",
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
