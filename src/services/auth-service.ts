import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../graphql/types';

const API_BASE_URL = 'http://localhost:3000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

class AuthService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log(`🌐 Making ${options.method || 'GET'} request to: ${url}`);

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          if (response.statusText) {
            errorMessage = `${response.status}: ${response.statusText}`;
          }
        }

        const error: any = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      console.log(`✅ Request successful:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Request failed:`, error);

      if (error instanceof Error) {
        // Add status code if available
        if ('status' in error) {
          (error as any).status = (error as any).status;
        }
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('🔐 Attempting login with:', { email: credentials.email });

    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    console.log('📝 Attempting registration with:', {
      email: credentials.email,
      name: credentials.name,
    });

    return this.makeRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Attempting logout...');

      // If your server has a logout endpoint, call it here
      // await this.makeRequest('/auth/logout', { method: 'POST' });

      // For now, just clear local storage
      await AsyncStorage.multiRemove(['authToken', 'user']);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if the server call fails, clear local storage
      await AsyncStorage.multiRemove(['authToken', 'user']);
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return null;

      console.log('🔄 Attempting token refresh...');

      // If your server has a refresh endpoint, implement it here
      // const response = await this.makeRequest<{ token: string }>('/auth/refresh', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // return response.token;

      console.log('ℹ️ Token refresh not implemented, returning existing token');
      return token;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return null;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      console.log('🔍 Validating token...');

      // If your server has a validate endpoint, implement it here
      // await this.makeRequest('/auth/validate', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // return true;

      // For now, just check if token exists and has valid format
      const isValid = token.length > 0 && token.includes('.');
      console.log(`✅ Token validation: ${isValid ? 'valid' : 'invalid'}`);
      return isValid;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  }

  // Test method to check server connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing server connectivity...');

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'OPTIONS', // Use OPTIONS to test connectivity without sending data
      });

      const isConnected = response.status !== 0; // 0 usually means network error
      console.log(`✅ Server connectivity test: ${isConnected ? 'successful' : 'failed'}`);

      return isConnected;
    } catch (error) {
      console.error('❌ Server connectivity test failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
