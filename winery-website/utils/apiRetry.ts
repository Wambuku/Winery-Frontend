interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  retryCondition?: (error: any) => boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isRetryableError = (error: any): boolean => {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP status codes that should be retried
  if (error.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }
  
  return false;
};

export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    retryCondition = isRetryableError
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      const isLastAttempt = attempt === maxAttempts;
      const shouldRetry = retryCondition(error);
      
      if (isLastAttempt || !shouldRetry) {
        throw error;
      }

      // Calculate delay with optional exponential backoff
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * waitTime;
      const finalDelay = waitTime + jitter;
      
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError;
};

export const createApiClient = (baseURL: string = '') => {
  const request = async <T>(
    endpoint: string,
    options: RequestInit = {},
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> => {
    const apiCall = async (): Promise<ApiResponse<T>> => {
      const url = `${baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          errorData.code || 'HTTP_ERROR',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;
    };

    if (retryOptions) {
      return withRetry(apiCall, retryOptions);
    }

    return apiCall();
  };

  return {
    get: <T>(endpoint: string, retryOptions?: RetryOptions) =>
      request<T>(endpoint, { method: 'GET' }, retryOptions),
    
    post: <T>(endpoint: string, data?: any, retryOptions?: RetryOptions) =>
      request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }, retryOptions),
    
    put: <T>(endpoint: string, data?: any, retryOptions?: RetryOptions) =>
      request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }, retryOptions),
    
    patch: <T>(endpoint: string, data?: any, retryOptions?: RetryOptions) =>
      request<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }, retryOptions),
    
    delete: <T>(endpoint: string, retryOptions?: RetryOptions) =>
      request<T>(endpoint, { method: 'DELETE' }, retryOptions),
  };
};

// Default API client with retry enabled
export const apiClient = createApiClient('/api');

// Utility function to handle API errors consistently
export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export default apiClient;