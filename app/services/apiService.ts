import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3000/api'; // Replace with your backend URL
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // Increased timeout
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
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = Date.now().toString();
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and retry logic
    this.api.interceptors.response.use(
      (response) => {
        // Reset retry count on successful response
        this.retryCount = 0;
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle rate limiting (429)
        if (error.response?.status === 429) {
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
            console.warn(`Rate limited. Retrying in ${delay}ms... (${this.retryCount}/${this.maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.api.request(originalRequest);
          } else {
            console.error('Max retries exceeded for rate limiting');
            this.retryCount = 0;
          }
        }

        // Handle token expiration
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          // You might want to trigger a logout action here
        }

        // Handle network errors with retry
        if (!error.response && error.request && this.retryCount < this.maxRetries) {
          this.retryCount++;
          const delay = 2000; // 2 seconds for network errors
          console.warn(`Network error. Retrying in ${delay}ms... (${this.retryCount}/${this.maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.api.request(originalRequest);
        }

        this.retryCount = 0;
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API calls with better error handling
  private async makeRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<T> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      if (!error.response && error.request) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  // Auth methods
  async signIn(email: string, password: string) {
    return this.makeRequest(() => 
      this.api.post('/auth/signin', { email, password })
    );
  }

  async signUp(email: string, password: string, name: string) {
    return this.makeRequest(() => 
      this.api.post('/auth/signup', { email, password, name })
    );
  }

  async signInWithGoogle(googleData: any) {
    return this.makeRequest(() => 
      this.api.post('/auth/google', googleData)
    );
  }

  async signOut() {
    return this.makeRequest(() => 
      this.api.post('/auth/signout')
    );
  }

  // Task methods with caching
  async getTasks(filters?: any) {
    return this.makeRequest(() => 
      this.api.get('/tasks', { 
        params: filters,
        headers: {
          'Cache-Control': 'max-age=60' // Cache for 1 minute
        }
      })
    );
  }

  async createTask(taskData: any) {
    return this.makeRequest(() => 
      this.api.post('/tasks', taskData)
    );
  }

  async updateTask(taskId: string, taskData: any) {
    return this.makeRequest(() => 
      this.api.put(`/tasks/${taskId}`, taskData)
    );
  }

  async deleteTask(taskId: string) {
    return this.makeRequest(() => 
      this.api.delete(`/tasks/${taskId}`)
    );
  }

  async toggleTaskComplete(taskId: string) {
    return this.makeRequest(() => 
      this.api.post(`/tasks/${taskId}/complete`)
    );
  }

  async getTaskStatistics() {
    return this.makeRequest(() => 
      this.api.get('/tasks/statistics')
    );
  }

  async searchTasks(query: string, filters?: any) {
    return this.makeRequest(() => 
      this.api.get('/search/tasks', { 
        params: { q: query, ...filters } 
      })
    );
  }

  // Project methods
  async getProjects() {
    return this.makeRequest(() => 
      this.api.get('/projects')
    );
  }

  async createProject(projectData: any) {
    return this.makeRequest(() => 
      this.api.post('/projects', projectData)
    );
  }

  async updateProject(projectId: string, projectData: any) {
    return this.makeRequest(() => 
      this.api.put(`/projects/${projectId}`, projectData)
    );
  }

  async deleteProject(projectId: string) {
    return this.makeRequest(() => 
      this.api.delete(`/projects/${projectId}`)
    );
  }

  // Focus session methods
  async getFocusSessions(filters?: any) {
    return this.makeRequest(() => 
      this.api.get('/focus/sessions', { params: filters })
    );
  }

  async createFocusSession(sessionData: any) {
    return this.makeRequest(() => 
      this.api.post('/focus/sessions', sessionData)
    );
  }

  async completeFocusSession(sessionId: string) {
    return this.makeRequest(() => 
      this.api.put(`/focus/sessions/${sessionId}/complete`, {
        completed_at: new Date().toISOString()
      })
    );
  }

  async getFocusStatistics() {
    return this.makeRequest(() => 
      this.api.get('/focus/statistics')
    );
  }

  async getFocusSettings() {
    return this.makeRequest(() => 
      this.api.get('/focus/settings')
    );
  }

  async updateFocusSettings(settings: any) {
    return this.makeRequest(() => 
      this.api.put('/focus/settings', settings)
    );
  }

  // Settings methods
  async getNotificationSettings() {
    return this.makeRequest(() => 
      this.api.get('/settings/notifications')
    );
  }

  async updateNotificationSettings(settings: any) {
    return this.makeRequest(() => 
      this.api.put('/settings/notifications', settings)
    );
  }

  async getThemeSettings() {
    return this.makeRequest(() => 
      this.api.get('/settings/theme')
    );
  }

  async updateThemeSettings(settings: any) {
    return this.makeRequest(() => 
      this.api.put('/settings/theme', settings)
    );
  }
}

export default new ApiService();