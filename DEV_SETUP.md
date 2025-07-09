# 🚀 Development Setup Guide

## Quick Start

### 1. Setup Database (lần đầu tiên)
```bash
npm run setup:db
```

### 2. Khởi động Development Environment
```bash
npm run dev
```

## Các lệnh có sẵn

### 🎯 Main Commands
- `npm run dev` - Khởi động cả backend và frontend với giao diện đẹp
- `npm run dev:simple` - Khởi động đơn giản với concurrently
- `npm start` - Chỉ khởi động frontend (Expo)
- `npm run setup:db` - Setup database (chạy lần đầu tiên)

### 🔧 Individual Commands
- `npm run backend` - Chỉ khởi động backend server
- `npm run frontend` - Chỉ khởi động frontend (Expo)
- `npm run dev:backend` - Khởi động backend với nodemon
- `npm run dev:frontend` - Khởi động frontend

### 📱 Platform Specific
- `npm run android` - Khởi động trên Android emulator
- `npm run ios` - Khởi động trên iOS simulator
- `npm run web` - Khởi động trên web browser

## 🌐 URLs

Sau khi chạy `npm run dev`:

- **Backend API**: http://localhost:3000
- **Frontend (Web)**: http://localhost:8081 (hoặc port khác được Expo chỉ định)
- **Health Check**: http://localhost:3000/health

## 📋 Expo Commands (khi frontend đã chạy)

- `a` - Mở Android emulator
- `i` - Mở iOS simulator  
- `w` - Mở trong web browser
- `r` - Reload app
- `m` - Toggle menu
- `j` - Mở debugger

## 🔧 Prerequisites

Đảm bảo bạn đã cài đặt:

1. **Node.js** (version 16+)
2. **npm** hoặc **yarn**
3. **Expo CLI**: `npm install -g @expo/cli`
4. **Android Studio** (cho Android development)
5. **Xcode** (cho iOS development, chỉ macOS)

## 🗄️ Database Setup

Backend sẽ tự động tạo database nếu chưa có. Đảm bảo:

1. MySQL server đang chạy
2. Tạo database (nếu cần)
3. Cập nhật thông tin database trong `backend/src/config/database.js`

## 🛠️ Troubleshooting

### Backend không khởi động
- Kiểm tra port 3000 có đang được sử dụng không
- Kiểm tra kết nối database
- Xem logs trong terminal

### Frontend không khởi động
- Kiểm tra Expo CLI đã được cài đặt
- Thử `expo doctor` để kiểm tra setup
- Xóa cache: `expo start -c`

### Lỗi kết nối API
- Đảm bảo backend đang chạy trên port 3000
- Kiểm tra URL trong `app/contexts/AuthContext.tsx` và `app/contexts/TaskContext.tsx`
- Nếu chạy trên device thật, thay đổi `localhost` thành IP của máy

## 📝 Environment Variables

Tạo file `.env` trong thư mục gốc:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
```

## 🎉 Happy Coding!

Bây giờ bạn có thể phát triển ứng dụng với một lệnh duy nhất! 