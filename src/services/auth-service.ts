import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../graphql/types';
import { supabase, signInWithEmail, signOut, getCurrentSession } from '../lib/supabase';

const API_BASE_URL = 'https://deploy-preview-3--host-inventory-sync.netlify.app/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  accounts: any[];
  currentAccount: any;
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
    console.log('🔐 Attempting Supabase login with:', { email: credentials.email });

    try {
      // Step 1: Authenticate with Supabase
      const { user, accessToken } = await signInWithEmail(credentials.email, credentials.password);

      if (!user || !accessToken) {
        throw new Error('Authentication failed');
      }

      // Store the Supabase access token
      await AsyncStorage.setItem('supabaseAccessToken', accessToken);

      // Step 2: Get user's accounts from GraphQL API
      const accounts = await this.getUserAccounts(accessToken);

      if (accounts.length === 0) {
        throw new Error('User has no accounts. Contact administrator.');
      }

      // Step 3: Set default account context (usually the first account)
      const defaultAccount = accounts[0];
      await AsyncStorage.setItem('currentAccountId', defaultAccount.id);

      // Step 4: Get user info from GraphQL API
      const userInfo = await this.getUserInfo(accessToken);

      // Store user info and account context
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));

      return {
        token: accessToken,
        user: userInfo,
        accounts,
        currentAccount: defaultAccount,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Attempting logout...');

      // Sign out from Supabase
      await signOut();

      // Clear local storage
      await AsyncStorage.multiRemove([
        'supabaseAccessToken',
        'user',
        'authToken',
        'currentAccountId',
      ]);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if the server call fails, clear local storage
      await AsyncStorage.multiRemove([
        'supabaseAccessToken',
        'user',
        'authToken',
        'currentAccountId',
      ]);
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const session = await getCurrentSession();
      if (!session) return null;

      console.log('🔄 Attempting token refresh...');

      // Supabase handles token refresh automatically
      const accessToken = session.access_token;

      if (accessToken) {
        await AsyncStorage.setItem('supabaseAccessToken', accessToken);
        console.log('✅ Token refreshed successfully');
        return accessToken;
      }

      return null;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return null;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      console.log('🔍 Validating token...');

      // Try to get user info with the token to validate it
      const userInfo = await this.getUserInfo(token);
      const isValid = !!userInfo;

      console.log(`✅ Token validation: ${isValid ? 'valid' : 'invalid'}`);
      return isValid;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  }

  // Step 2: Get user's accounts from GraphQL API
  public async getUserAccounts(accessToken: string): Promise<any[]> {
    console.log('📋 Getting user accounts...');

    try {
      const response = await fetch(`${API_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'x-client-id': 'mobile-app-v1',
        },
        body: JSON.stringify({
          query: `
            query GetMyAccounts {
              myAccounts {
                id
                name
                description
                createdAt
                updatedAt
                properties {
                  id
                  name
                  address
                  description
                  barcode
                  createdAt
                  updatedAt
                }
                accountUsers {
                  id
                  role
                  isActive
                  user {
                    id
                    name
                    email
                  }
                }
              }
            }
          `,
        }),
      });

      console.log('📡 GraphQL response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GraphQL request failed:', errorText);
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📋 GraphQL response:', JSON.stringify(result, null, 2));

      if (result.errors) {
        console.error('❌ GraphQL errors:', result.errors);
        throw new Error(result.errors[0]?.message || 'Failed to get user accounts');
      }

      console.log(`✅ Found ${result.data.myAccounts.length} accounts`);
      return result.data.myAccounts;
    } catch (error) {
      console.error('❌ Error in getUserAccounts:', error);
      throw error;
    }
  }

  public async getUserInfo(accessToken: string): Promise<User> {
    console.log('👤 Getting user info...');

    try {
      // Make a request to the GraphQL API to get user info
      const response = await fetch(`${API_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'x-client-id': 'mobile-app-v1',
        },
        body: JSON.stringify({
          query: `
            query GetMe {
              me {
                id
                email
                name
                createdAt
                updatedAt
              }
            }
          `,
        }),
      });

      console.log('📡 GetMe response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GetMe request failed:', errorText);
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('👤 GetMe response:', JSON.stringify(result, null, 2));

      if (result.errors) {
        console.error('❌ GetMe GraphQL errors:', result.errors);
        throw new Error(result.errors[0]?.message || 'Failed to get user info');
      }

      return result.data.me;
    } catch (error) {
      console.error('❌ Error in getUserInfo:', error);
      throw error;
    }
  }

  // Test method to check server connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing server connectivity...');

      const response = await fetch(`${API_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': 'mobile-app-v1',
        },
        body: JSON.stringify({
          query: `
            query TestConnection {
              __typename
            }
          `,
        }),
      });

      const isConnected = response.ok;
      console.log(`✅ Server connectivity test: ${isConnected ? 'successful' : 'failed'}`);

      return isConnected;
    } catch (error) {
      console.error('❌ Server connectivity test failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
