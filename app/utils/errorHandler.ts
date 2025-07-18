import { Alert } from 'react-native';

export interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: {
        code: string;
        message: string;
      };
    };
  };
  request?: any;
  message: string;
}

export const handleApiError = (error: ApiError) => {
  let title = 'Error';
  let message = 'An unexpected error occurred';
  
  if (error.response?.status === 429) {
    title = 'Too Many Requests';
    message = 'You are making too many requests. Please wait a moment and try again.';
  } else if (error.response?.status === 401) {
    title = 'Authentication Error';
    message = 'Your session has expired. Please sign in again.';
  } else if (error.response?.status === 403) {
    title = 'Access Denied';
    message = 'You do not have permission to perform this action.';
  } else if (error.response?.status >= 500) {
    title = 'Server Error';
    message = 'The server is experiencing issues. Please try again later.';
  } else if (error.response?.data?.error?.message) {
    message = error.response.data.error.message;
  } else if (error.message) {
    message = error.message;
  }
  
  Alert.alert(title, message);
};

export const isNetworkError = (error: ApiError) => {
  return !error.response && error.request;
};

export const isRateLimitError = (error: ApiError) => {
  return error.response?.status === 429;
};

export const shouldRetry = (error: ApiError, retryCount: number, maxRetries: number = 3) => {
  if (retryCount >= maxRetries) return false;
  
  // Retry on network errors
  if (isNetworkError(error)) return true;
  
  // Retry on rate limit errors
  if (isRateLimitError(error)) return true;
  
  // Retry on server errors (5xx)
  if (error.response?.status && error.response.status >= 500) return true;
  
  return false;
};

export const getRetryDelay = (retryCount: number, isRateLimit: boolean = false) => {
  if (isRateLimit) {
    // Exponential backoff for rate limiting: 1s, 2s, 4s, 8s...
    return Math.pow(2, retryCount) * 1000;
  }
  
  // Fixed delay for other errors
  return 2000; // 2 seconds
};