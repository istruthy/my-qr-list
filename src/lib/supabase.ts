import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration - you need to get these from your Supabase project
const SUPABASE_URL = 'https://icmzcgutdwljqdidodsu.supabase.co'; // Replace with your actual Supabase project URL
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbXpjZ3V0ZHdsanFkaWRvZHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MzA1NTksImV4cCI6MjA2MTMwNjU1OX0.2_ewNKCX5QuVBdOSE4Wn_uhdrDG7sT8C3hkHzA0YyNs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export types for convenience
export type { User, Session, AuthError } from '@supabase/supabase-js';

// Authentication helper functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return {
    user: data.user,
    session: data.session,
    accessToken: data.session.access_token,
  };
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;

  return {
    user: data.user,
    session: data.session,
    accessToken: data.session?.access_token,
  };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data;
};

export const validateAndRefreshSession = async () => {
  try {
    // Get current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }

    if (!session) {
      console.log('ℹ️ No session found');
      return null;
    }

    // Check if session is expired or close to expiring
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;

    if (expiresAt && now >= expiresAt) {
      console.log('🔄 Session expired, refreshing...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('❌ Error refreshing session:', refreshError);
        return null;
      }

      console.log('✅ Session refreshed successfully');
      return refreshData.session;
    }

    // Check if session expires soon (within 5 minutes)
    if (expiresAt && expiresAt - now < 300) {
      console.log('🔄 Session expires soon, refreshing...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('❌ Error refreshing session:', refreshError);
        return null;
      }

      console.log('✅ Session refreshed successfully');
      return refreshData.session;
    }

    console.log('✅ Session is valid');
    return session;
  } catch (error) {
    console.error('❌ Error validating session:', error);
    return null;
  }
};
