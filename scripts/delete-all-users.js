const { User } = require('../backend/src/models');

(async () => {
  try {
    const count = await User.destroy({ where: {}, truncate: true });
    console.log(`Đã xóa toàn bộ user (${count} records)`);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi xóa user:', err);
    process.exit(1);
  }
})(); 