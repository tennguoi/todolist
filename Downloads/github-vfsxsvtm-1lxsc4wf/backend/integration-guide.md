# React Native Integration Guide

## Updating Your React Native App to Use MySQL Backend

### 1. Create API Service

Create a new file `app/services/apiService.ts`:

```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'https://your-backend-api.com/api'; // Replace with your backend URL

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          // You might want to trigger a logout action here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const response = await this.api.post('/auth/signin', { email, password });
    return response.data;
  }

  async signUp(email: string, password: string, name: string) {
    const response = await this.api.post('/auth/signup', { email, password, name });
    return response.data;
  }

  async signInWithGoogle(googleData: any) {
    const response = await this.api.post('/auth/google', googleData);
    return response.data;
  }

  async signOut() {
    const response = await this.api.post('/auth/signout');
    return response.data;
  }

  // Task methods
  async getTasks(filters?: any) {
    const response = await this.api.get('/tasks', { params: filters });
    return response.data;
  }

  async createTask(taskData: any) {
    const response = await this.api.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(taskId: string, taskData: any) {
    const response = await this.api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  }

  async deleteTask(taskId: string) {
    const response = await this.api.delete(`/tasks/${taskId}`);
    return response.data;
  }

  async toggleTaskComplete(taskId: string) {
    const response = await this.api.post(`/tasks/${taskId}/complete`);
    return response.data;
  }

  async getTaskStatistics() {
    const response = await this.api.get('/tasks/statistics');
    return response.data;
  }

  async searchTasks(query: string, filters?: any) {
    const response = await this.api.get('/search/tasks', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  }

  // Project methods
  async getProjects() {
    const response = await this.api.get('/projects');
    return response.data;
  }

  async createProject(projectData: any) {
    const response = await this.api.post('/projects', projectData);
    return response.data;
  }

  async updateProject(projectId: string, projectData: any) {
    const response = await this.api.put(`/projects/${projectId}`, projectData);
    return response.data;
  }

  async deleteProject(projectId: string) {
    const response = await this.api.delete(`/projects/${projectId}`);
    return response.data;
  }

  // Focus session methods
  async getFocusSessions(filters?: any) {
    const response = await this.api.get('/focus/sessions', { params: filters });
    return response.data;
  }

  async createFocusSession(sessionData: any) {
    const response = await this.api.post('/focus/sessions', sessionData);
    return response.data;
  }

  async completeFocusSession(sessionId: string) {
    const response = await this.api.put(`/focus/sessions/${sessionId}/complete`, {
      completed_at: new Date().toISOString()
    });
    return response.data;
  }

  async getFocusStatistics() {
    const response = await this.api.get('/focus/statistics');
    return response.data;
  }

  async getFocusSettings() {
    const response = await this.api.get('/focus/settings');
    return response.data;
  }

  async updateFocusSettings(settings: any) {
    const response = await this.api.put('/focus/settings', settings);
    return response.data;
  }

  // Settings methods
  async getNotificationSettings() {
    const response = await this.api.get('/settings/notifications');
    return response.data;
  }

  async updateNotificationSettings(settings: any) {
    const response = await this.api.put('/settings/notifications', settings);
    return response.data;
  }

  async getThemeSettings() {
    const response = await this.api.get('/settings/theme');
    return response.data;
  }

  async updateThemeSettings(settings: any) {
    const response = await this.api.put('/settings/theme', settings);
    return response.data;
  }
}

export default new ApiService();
```

### 2. Update TaskContext to Use API

Update your `app/contexts/TaskContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

// ... existing interfaces ...

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from API
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [tasksResponse, projectsResponse] = await Promise.all([
        apiService.getTasks(),
        apiService.getProjects()
      ]);
      
      if (tasksResponse.success) {
        setTasks(tasksResponse.data);
      }
      
      if (projectsResponse.success) {
        setProjects(projectsResponse.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createTask(taskData);
      if (response.success) {
        setTasks(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const response = await apiService.updateTask(taskId, taskData);
      if (response.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...response.data } : task
        ));
        return response.data;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await apiService.deleteTask(taskId);
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    try {
      const response = await apiService.toggleTaskComplete(taskId);
      if (response.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...response.data } : task
        ));
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  };

  const searchTasks = async (query: string) => {
    try {
      const response = await apiService.searchTasks(query);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  };

  const getStatistics = async () => {
    try {
      const response = await apiService.getTaskStatistics();
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Error getting statistics:', error);
    }
    
    // Fallback to local calculation
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.isCompleted).length,
      pending: tasks.filter(task => !task.isCompleted).length,
    };
  };

  // Project methods
  const addProject = async (projectData: Omit<Project, 'id' | 'taskCount'>) => {
    try {
      const response = await apiService.createProject(projectData);
      if (response.success) {
        setProjects(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const response = await apiService.deleteProject(projectId);
      if (response.success) {
        setProjects(prev => prev.filter(project => project.id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      projects,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      searchTasks,
      getStatistics,
      addProject,
      deleteProject,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
```

### 3. Update AuthContext to Use API

Update your `app/contexts/AuthContext.tsx` to use the API service instead of mock authentication.

### 4. Update FocusSession to Use API

Update your `FocusSession.tsx` component to use the API for settings and statistics:

```typescript
// Replace AsyncStorage calls with API calls
const loadSettings = async () => {
  try {
    const response = await apiService.getFocusSettings();
    if (response.success) {
      const settings = response.data;
      setSettings(settings);
      setTimeLeft(settings.work_duration * 60);
    }
  } catch (error) {
    console.error('Error loading focus settings:', error);
    // Fallback to default settings
    setTimeLeft(25 * 60);
  }
};

const saveSettings = async (newSettings: FocusSettings) => {
  setSettings(newSettings);
  try {
    await apiService.updateFocusSettings(newSettings);
  } catch (error) {
    console.error('Error saving focus settings:', error);
  }
};

const loadStats = async () => {
  try {
    const response = await apiService.getFocusStatistics();
    if (response.success) {
      setStats(response.data);
    }
  } catch (error) {
    console.error('Error loading focus statistics:', error);
  }
};
```

### 5. Environment Configuration

Create `app/config/environment.ts`:

```typescript
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api', // Your local backend
  },
  production: {
    API_BASE_URL: 'https://your-production-api.com/api', // Your production backend
  },
};

const environment = __DEV__ ? 'development' : 'production';

export default config[environment];
```

### 6. Error Handling

Create `app/utils/errorHandler.ts`:

```typescript
import { Alert } from 'react-native';

export const handleApiError = (error: any) => {
  let message = 'An unexpected error occurred';
  
  if (error.response?.data?.error?.message) {
    message = error.response.data.error.message;
  } else if (error.message) {
    message = error.message;
  }
  
  Alert.alert('Error', message);
};

export const isNetworkError = (error: any) => {
  return !error.response && error.request;
};
```

### 7. Offline Support (Optional)

For offline functionality, you can implement a sync mechanism:

```typescript
// app/services/syncService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo';
import apiService from './apiService';

class SyncService {
  async syncPendingChanges() {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    
    if (!isConnected) return;
    
    const pendingChanges = await AsyncStorage.getItem('pendingChanges');
    if (pendingChanges) {
      const changes = JSON.parse(pendingChanges);
      
      for (const change of changes) {
        try {
          await this.processChange(change);
        } catch (error) {
          console.error('Error syncing change:', error);
        }
      }
      
      await AsyncStorage.removeItem('pendingChanges');
    }
  }
  
  private async processChange(change: any) {
    switch (change.type) {
      case 'CREATE_TASK':
        await apiService.createTask(change.data);
        break;
      case 'UPDATE_TASK':
        await apiService.updateTask(change.id, change.data);
        break;
      case 'DELETE_TASK':
        await apiService.deleteTask(change.id);
        break;
    }
  }
}

export default new SyncService();
```

### 8. Testing

1. Set up your backend server with the provided schema
2. Update the API_BASE_URL in your config
3. Test authentication flow
4. Test task CRUD operations
5. Test focus session functionality
6. Test offline/online sync (if implemented)

This integration will replace your local AsyncStorage with a proper MySQL backend while maintaining the same user experience.
