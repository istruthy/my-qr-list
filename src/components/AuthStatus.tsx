import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, isLoading, accounts, currentAccount } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 Testing Supabase connection...');

      // Test 1: Check if we can reach Supabase
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Supabase connection error:', error);
        Alert.alert('Supabase Test', `Connection failed: ${error.message}`);
        return;
      }

      console.log('✅ Supabase connection successful');
      console.log('📊 Current session:', data.session);

      Alert.alert('Supabase Test', 'Connection successful! Check console for details.');
    } catch (error) {
      console.error('❌ Supabase test error:', error);
      Alert.alert('Supabase Test', `Test failed: ${error}`);
    }
  };

  const testSupabaseAuth = async () => {
    if (!testEmail || !testPassword) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      console.log('🔐 Testing Supabase authentication...');
      console.log('📧 Email:', testEmail);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        Alert.alert('Auth Test', `Authentication failed: ${error.message}`);
        return;
      }

      console.log('✅ Supabase authentication successful!');
      console.log('👤 User:', data.user);
      console.log('🔑 Session:', data.session);
      console.log('🎫 Access token:', data.session?.access_token);

      Alert.alert('Auth Test', 'Authentication successful! Check console for details.');

      // Clear the test fields
      setTestEmail('');
      setTestPassword('');
    } catch (error) {
      console.error('❌ Supabase auth test error:', error);
      Alert.alert('Auth Test', `Test failed: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading authentication...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Authentication Test</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status:</Text>
          <Text style={styles.text}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
          </Text>
          {user && (
            <Text style={styles.text}>
              User: {user.name} ({user.email})
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information:</Text>
          <Text style={styles.text}>Total Accounts: {accounts.length}</Text>
          {currentAccount && (
            <Text style={styles.text}>Current Account: {currentAccount.name}</Text>
          )}
          {accounts.length > 0 && (
            <View style={styles.accountsList}>
              <Text style={styles.subsectionTitle}>Available Accounts:</Text>
              {accounts.map((account, index) => (
                <Text key={account.id} style={styles.accountItem}>
                  {index + 1}. {account.name} {account.id === currentAccount?.id ? '(Current)' : ''}
                </Text>
              ))}
            </View>
          )}
          {user && user.accounts && user.accounts.length > 0 && (
            <View style={styles.accountsList}>
              <Text style={styles.subsectionTitle}>User Account Relationships:</Text>
              {user.accounts.map((accountUser, index) => (
                <Text key={accountUser.id} style={styles.accountItem}>
                  {index + 1}. Role: {accountUser.role} - Account:{' '}
                  {accountUser.account?.name || 'Unknown'} (Active:{' '}
                  {accountUser.isActive ? 'Yes' : 'No'})
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Supabase Connection:</Text>
          <TouchableOpacity style={styles.testButton} onPress={testSupabaseConnection}>
            <Text style={styles.testButtonText}>Test Connection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Supabase Authentication:</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={testEmail}
            onChangeText={setTestEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={testPassword}
            onChangeText={setTestPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.testButton} onPress={testSupabaseAuth}>
            <Text style={styles.testButtonText}>Test Auth</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>
            1. First test the connection to verify Supabase is reachable
          </Text>
          <Text style={styles.instructionText}>
            2. Then test authentication with valid credentials
          </Text>
          <Text style={styles.instructionText}>3. Check the console for detailed logs</Text>
          <Text style={styles.instructionText}>
            4. After successful auth, you should see accounts loaded
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    color: '#555',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  accountsList: {
    marginTop: 8,
    paddingLeft: 8,
  },
  accountItem: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});
