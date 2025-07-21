-- MySQL Database Schema for Todo App
-- Create database
CREATE DATABASE IF NOT EXISTS todo_app;
USE todo_app;
select * from tasks ;
select * from users ;
select * from projects ;
select * from task_tags ;
select * from focus_sessions ;
select * from focus_settings ;
select * from notification_settings ;
select * from theme_settings ;
select * from task_shares ;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),

   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_projects (user_id)
);

-- Tasks table
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    category VARCHAR(100) DEFAULT 'Personal',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_type ENUM('daily', 'weekly', 'monthly'),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_user_tasks (user_id),
    INDEX idx_task_dates (start_date, due_date),
    INDEX idx_task_status (is_completed),
    INDEX idx_task_priority (priority)
);

-- Task tags table (many-to-many relationship)
CREATE TABLE task_tags (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id VARCHAR(36) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_task_tag (task_id, tag),
    INDEX idx_task_tags (task_id),
    INDEX idx_tag_search (tag)
);

-- Focus sessions table
CREATE TABLE focus_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    session_type ENUM('work', 'shortBreak', 'longBreak') DEFAULT 'work',
    duration_minutes INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    INDEX idx_user_sessions (user_id),
    INDEX idx_session_dates (started_at, completed_at)
);

-- Focus settings table
CREATE TABLE focus_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) UNIQUE NOT NULL,
    work_duration INT DEFAULT 25,
    short_break_duration INT DEFAULT 5,
    long_break_duration INT DEFAULT 15,
    sessions_until_long_break INT DEFAULT 4,
    sound_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification settings table
CREATE TABLE notification_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    reminder_time INT DEFAULT 60,
    daily_reminder BOOLEAN DEFAULT TRUE,
    daily_reminder_time TIME DEFAULT '09:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Theme settings table
CREATE TABLE theme_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) UNIQUE NOT NULL,
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Task sharing table (for collaborative features)
CREATE TABLE task_shares (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id VARCHAR(36) NOT NULL,
    shared_by_user_id VARCHAR(36) NOT NULL,
    shared_with_user_id VARCHAR(36) NOT NULL,
    permission ENUM('viewer', 'editor') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_task_share (task_id, shared_with_user_id),
    INDEX idx_shared_tasks (shared_with_user_id)
);

