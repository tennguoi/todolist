const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'minh152005minh', // Thay đổi theo mật khẩu của bạn
  database: 'todo_app'
};

async function setupDatabase() {
  console.log('🗄️ Setting up database...\n');

  try {
    // Tạo connection không có database
    const connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    console.log('✅ Connected to MySQL server');

    // Tạo database nếu chưa có
    try {
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DB_CONFIG.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Database '${DB_CONFIG.database}' created/verified`);
    } catch (error) {
      console.error('❌ Error creating database:', error.message);
      return;
    }

    await connection.end();

    // Test connection với database
    const sequelize = new Sequelize(
      DB_CONFIG.database,
      DB_CONFIG.user,
      DB_CONFIG.password,
      {
        host: DB_CONFIG.host,
        port: DB_CONFIG.port,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: true,
          underscored: true,
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
        dialectOptions: {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
        },
      }
    );

    await sequelize.authenticate();
    console.log('✅ Database connection test successful');

    // Sync models
    await sequelize.sync({ alter: true, force: false });
    console.log('✅ Database models synchronized');

    await sequelize.close();
    console.log('\n🎉 Database setup completed successfully!');
    console.log('💡 You can now run: npm run dev');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure MySQL server is running');
    console.log('   2. Check your MySQL credentials in scripts/setup-db.js');
    console.log('   3. Make sure you have permission to create databases');
    console.log('   4. Try running: mysql -u root -p');
  }
}

setupDatabase(); 