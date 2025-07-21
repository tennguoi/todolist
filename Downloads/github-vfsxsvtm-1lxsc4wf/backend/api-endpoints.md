# API Endpoints Documentation

## Base URL
```
https://your-backend-api.com/api
```

## Authentication
All endpoints (except auth) require Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Authentication Endpoints

### POST /auth/signin
Sign in with email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /auth/signup
Create new user account
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### POST /auth/google
Sign in with Google OAuth
```json
{
  "googleId": "google_user_id",
  "email": "user@gmail.com",
  "name": "John Doe",
  "avatar": "https://avatar-url.com",
  "idToken": "google_id_token"
}
```

### POST /auth/signout
Sign out user (invalidate token)

## User Endpoints

### GET /users/profile
Get current user profile

### PUT /users/profile
Update user profile
```json
{
  "name": "Updated Name",
  "avatar": "https://new-avatar-url.com"
}
```

## Task Endpoints

### GET /tasks
Get all tasks for current user
Query parameters:
- `completed`: boolean (filter by completion status)
- `category`: string (filter by category)
- `priority`: string (filter by priority)
- `project_id`: string (filter by project)
- `start_date`: date (filter by start date)
- `due_date`: date (filter by due date)
- `search`: string (search in title and description)

### POST /tasks
Create new task
```json
{
  "title": "Task Title",
  "description": "Task description",
  "start_date": "2024-01-15",
  "due_date": "2024-01-20",
  "category": "Personal",
  "priority": "high",
  "project_id": "project-uuid",
  "tags": ["tag1", "tag2"],
  "is_recurring": false,
  "recurring_type": "daily"
}
```

### GET /tasks/:id
Get specific task by ID

### PUT /tasks/:id
Update task
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "medium",
  "is_completed": true
}
```

### DELETE /tasks/:id
Delete task

### POST /tasks/:id/complete
Toggle task completion status

### GET /tasks/statistics
Get task statistics
Response:
```json
{
  "total": 25,
  "completed": 15,
  "pending": 10,
  "overdue": 3,
  "by_priority": {
    "high": 5,
    "medium": 12,
    "low": 8
  },
  "by_category": {
    "Personal": 10,
    "Work": 8,
    "Health": 7
  }
}
```

## Project Endpoints

### GET /projects
Get all projects for current user

### POST /projects
Create new project
```json
{
  "name": "Project Name",
  "color": "#3B82F6"
}
```

### PUT /projects/:id
Update project
```json
{
  "name": "Updated Project Name",
  "color": "#EF4444"
}
```

### DELETE /projects/:id
Delete project (tasks will be unassigned, not deleted)

### GET /projects/:id/tasks
Get all tasks for specific project

## Focus Session Endpoints

### GET /focus/sessions
Get focus sessions for current user
Query parameters:
- `date`: date (filter by specific date)
- `limit`: number (limit results)

### POST /focus/sessions
Create new focus session
```json
{
  "task_id": "task-uuid",
  "session_type": "work",
  "duration_minutes": 25
}
```

### PUT /focus/sessions/:id/complete
Mark focus session as completed
```json
{
  "completed_at": "2024-01-15T10:30:00Z"
}
```

### GET /focus/statistics
Get focus session statistics
Response:
```json
{
  "total_sessions": 45,
  "today_sessions": 3,
  "week_sessions": 15,
  "total_focus_time": 1125,
  "average_session_length": 25,
  "last_session_date": "2024-01-15"
}
```

### GET /focus/settings
Get focus settings for current user

### PUT /focus/settings
Update focus settings
```json
{
  "work_duration": 25,
  "short_break_duration": 5,
  "long_break_duration": 15,
  "sessions_until_long_break": 4,
  "sound_enabled": true
}
```

## Settings Endpoints

### GET /settings/notifications
Get notification settings

### PUT /settings/notifications
Update notification settings
```json
{
  "enabled": true,
  "reminder_time": 60,
  "daily_reminder": true,
  "daily_reminder_time": "09:00"
}
```

### GET /settings/theme
Get theme settings

### PUT /settings/theme
Update theme settings
```json
{
  "theme": "dark"
}
```

## Task Sharing Endpoints

### POST /tasks/:id/share
Share task with another user
```json
{
  "email": "user@example.com",
  "permission": "editor"
}
```

### GET /tasks/:id/shares
Get all users who have access to task

### DELETE /tasks/:id/shares/:userId
Remove user access to task

### GET /tasks/shared
Get all tasks shared with current user

## Search Endpoints

### GET /search/tasks
Search tasks
Query parameters:
- `q`: string (search query)
- `category`: string (filter by category)
- `priority`: string (filter by priority)
- `completed`: boolean (filter by completion status)

### GET /search/suggestions
Get search suggestions based on user's tasks and tags

## Error Responses

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

## Success Responses

All endpoints return consistent success responses:
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```
