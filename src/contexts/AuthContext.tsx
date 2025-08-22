import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { supabase, validateAndRefreshSession } from '../lib/supabase';
import { authService } from '../services/auth-service';
import type { User, Account } from '../graphql/types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accounts: Account[];
  currentAccount: Account | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentAccount: (account: Account) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && user) {
        console.log('🔄 App became active, validating session...');
        try {
          const session = await validateAndRefreshSession();
          if (!session) {
            console.log('❌ Session validation failed, clearing auth state...');
            await clearStoredAuth();
          } else {
            console.log('✅ Session validation successful');
          }
        } catch (error) {
          console.error('❌ Error validating session on app state change:', error);
          await clearStoredAuth();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [user]);

  // Debug: Monitor currentAccount state changes
  useEffect(() => {
    console.log('🔍 AuthContext: currentAccount state changed to:', currentAccount);
  }, [currentAccount]);

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing authentication...');

      // First, validate and refresh the current session if needed
      const session = await validateAndRefreshSession();

      if (session) {
        console.log('✅ Found valid Supabase session, restoring user data...');
        // We have a valid session, restore user data
        await restoreUserDataFromSession(session);
      } else {
        console.log('ℹ️ No valid Supabase session found, checking stored data...');
        // No valid session, try to load stored data
        await loadStoredAuth();
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      await clearStoredAuth();
    } finally {
      setIsLoading(false);
    }

    // Set up auth listener after initialization
    setupSupabaseAuthListener();
  };

  const restoreUserDataFromSession = async (session: any) => {
    try {
      console.log('🔄 Restoring user data from Supabase session...');

      const accessToken = session.access_token;
      await AsyncStorage.setItem('supabaseAccessToken', accessToken);

      // Get user info and accounts from GraphQL API
      const userInfo = await authService.getUserInfo(accessToken);
      const userAccounts = await authService.getUserAccounts(accessToken);

      console.log('🔍 Raw userAccounts from GraphQL:', JSON.stringify(userAccounts, null, 2));

      // The API returns Account objects directly, not AccountUser objects
      const extractedAccounts = userAccounts;

      console.log(
        '🔍 Using accounts directly (no extraction needed):',
        JSON.stringify(extractedAccounts, null, 2)
      );

      setUser(userInfo);
      setAccounts(extractedAccounts);

      // Set default account if available
      if (extractedAccounts.length > 0) {
        const defaultAccount = extractedAccounts[0];
        console.log('🔍 Setting current account to:', defaultAccount);
        setCurrentAccount(defaultAccount);
        await AsyncStorage.setItem('currentAccountId', defaultAccount.id);
        console.log('✅ Set current account:', defaultAccount.name, 'with ID:', defaultAccount.id);
      } else {
        console.log('❌ No accounts extracted from userAccounts');
      }

      // Store user info and accounts
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
      await AsyncStorage.setItem('accounts', JSON.stringify(extractedAccounts));

      console.log('✅ User data restored from session:', userInfo.email, userAccounts.length);
    } catch (error) {
      console.error('❌ Error restoring user data from session:', error);
      // Clear stored data if restoration fails
      await clearStoredAuth();
    }
  };

  const clearStoredAuth = async () => {
    try {
      await AsyncStorage.multiRemove([
        'user',
        'accounts',
        'currentAccountId',
        'supabaseAccessToken',
      ]);
      setUser(null);
      setAccounts([]);
      setCurrentAccount(null);
      console.log('🧹 Cleared stored authentication data');
    } catch (error) {
      console.error('❌ Error clearing stored auth:', error);
    }
  };

  const validateStoredToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('supabaseAccessToken');
      if (!storedToken) {
        console.log('ℹ️ No stored token found');
        return false;
      }

      // Get current Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log('❌ No current Supabase session');
        return false;
      }

      // Compare stored token with current session token
      if (storedToken === session.access_token) {
        console.log('✅ Stored token matches current session');
        return true;
      } else {
        console.log('❌ Stored token does not match current session');
        return false;
      }
    } catch (error) {
      console.error('❌ Error validating stored token:', error);
      return false;
    }
  };

  const setupSupabaseAuthListener = () => {
    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Supabase auth state change:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session) {
        // User signed in, get full user data from GraphQL API
        try {
          const accessToken = session.access_token;
          await AsyncStorage.setItem('supabaseAccessToken', accessToken);

          // Get user info and accounts from GraphQL API
          const userInfo = await authService.getUserInfo(accessToken);
          const userAccounts = await authService.getUserAccounts(accessToken);

          console.log('🔍 Raw userAccounts from GraphQL:', JSON.stringify(userAccounts, null, 2));

          // The API returns Account objects directly, not AccountUser objects
          // So we don't need to extract anything - userAccounts are already Account objects
          const extractedAccounts = userAccounts;

          console.log(
            '🔍 Using accounts directly (no extraction needed):',
            JSON.stringify(extractedAccounts, null, 2)
          );

          setUser(userInfo);
          setAccounts(extractedAccounts);

          // Set default account if available
          if (extractedAccounts.length > 0) {
            const defaultAccount = extractedAccounts[0];
            console.log('🔍 Setting current account to:', defaultAccount);
            setCurrentAccount(defaultAccount);
            await AsyncStorage.setItem('currentAccountId', defaultAccount.id);
            console.log(
              '✅ Set current account:',
              defaultAccount.name,
              'with ID:',
              defaultAccount.id
            );

            // Debug: Check if state was actually set
            console.log(
              '🔍 AuthContext: After setCurrentAccount, currentAccount state should be:',
              defaultAccount.id
            );

            // Debug: Log the current state values
            console.log('🔍 AuthContext: Current state values after setState calls:');
            console.log('  - user:', userInfo);
            console.log('  - accounts:', extractedAccounts);
            console.log('  - currentAccount: setting to', defaultAccount);
          } else {
            console.log('❌ No accounts extracted from userAccounts');
          }

          // Store user info and accounts
          await AsyncStorage.setItem('user', JSON.stringify(userInfo));
          await AsyncStorage.setItem('accounts', JSON.stringify(extractedAccounts));

          console.log('✅ User signed in with accounts:', userInfo.email, userAccounts.length);
          console.log('📋 User accounts structure:', JSON.stringify(userInfo.accounts, null, 2));
          console.log('🏠 Extracted accounts:', JSON.stringify(userAccounts, null, 2));
        } catch (error) {
          console.error('❌ Error getting user data after sign in:', error);
          // Still set basic user info from Supabase
          const supabaseUser = session.user;
          const basicUserInfo: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            accounts: [],
            invitations: [],
          };
          setUser(basicUserInfo);
          await AsyncStorage.setItem('user', JSON.stringify(basicUserInfo));
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out, clear local state
        setUser(null);
        setAccounts([]);
        setCurrentAccount(null);
        await AsyncStorage.multiRemove([
          'user',
          'accounts',
          'currentAccountId',
          'supabaseAccessToken',
        ]);
        console.log('🚪 User signed out');
      }
    });

    return () => subscription.unsubscribe();
  };

  const loadStoredAuth = async () => {
    try {
      console.log('🔄 Loading stored authentication data...');

      // First validate that the stored token is still valid
      const isTokenValid = await validateStoredToken();
      if (!isTokenValid) {
        console.log('❌ Stored token is invalid, clearing stored data');
        await clearStoredAuth();
        return;
      }

      const [storedUser, storedAccounts, storedAccountId] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('accounts'),
        AsyncStorage.getItem('currentAccountId'),
      ]);

      if (storedUser && storedAccounts) {
        const userData = JSON.parse(storedUser);
        const accountsData = JSON.parse(storedAccounts);

        console.log('📱 Found stored user data:', userData.email);
        console.log('📱 Found stored accounts:', accountsData.length);

        setUser(userData);
        setAccounts(accountsData);

        if (storedAccountId && accountsData.length > 0) {
          const account = accountsData.find((acc: Account) => acc.id === storedAccountId);
          if (account) {
            setCurrentAccount(account);
            console.log('✅ Restored current account:', account.name);
          }
        }
      } else {
        console.log('ℹ️ No stored authentication data found');
      }
    } catch (error) {
      console.error('❌ Error loading stored auth:', error);
      await clearStoredAuth();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting Supabase login...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }

      console.log('✅ Login successful');
      // The auth state change listener will handle setting the user and accounts
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Attempting logout...');

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }

      console.log('✅ Logout successful');
      // The auth state change listener will handle clearing the state
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const setCurrentAccountContext = async (account: Account) => {
    try {
      setCurrentAccount(account);
      await AsyncStorage.setItem('currentAccountId', account.id);
      console.log('✅ Current account set to:', account.name);
    } catch (error) {
      console.error('Error setting current account:', error);
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('🔄 Refreshing authentication...');
      const session = await validateAndRefreshSession();
      if (session) {
        await restoreUserDataFromSession(session);
        console.log('✅ Authentication refreshed successfully.');
      } else {
        console.log('ℹ️ No valid Supabase session found, clearing stored data.');
        await clearStoredAuth();
      }
    } catch (error) {
      console.error('❌ Error refreshing authentication:', error);
      await clearStoredAuth();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    accounts,
    currentAccount,
    setCurrentAccount: setCurrentAccountContext,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
