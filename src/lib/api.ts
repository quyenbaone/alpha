import { toast } from 'sonner';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

class ApiService {
  private baseURL: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  private async retryRequest(
    url: string,
    options: RequestInit,
    retries: number
  ): Promise<Response> {
    try {
      return await this.fetchWithTimeout(url, options, this.timeout);
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.name === 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.retryRequest(url, options, retries - 1);
      }
      throw error;
    }
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const error: ApiError = new Error('API request failed');
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        error.data = await response.text();
      }
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await this.retryRequest(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      }, this.maxRetries);

      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.retryRequest(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      }, this.maxRetries);

      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.retryRequest(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      }, this.maxRetries);

      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.retryRequest(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      }, this.maxRetries);

      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof Error) {
      const apiError = error as ApiError;

      // Handle specific error cases
      if (apiError.status === 401) {
        // Handle unauthorized
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (apiError.status === 403) {
        toast.error('Bạn không có quyền thực hiện hành động này.');
      } else if (apiError.status === 404) {
        toast.error('Không tìm thấy tài nguyên yêu cầu.');
      } else if (apiError.status === 500) {
        toast.error('Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        toast.error(apiError.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } else {
      toast.error('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.');
    }
  }
}

export const api = new ApiService({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  maxRetries: 3,
});