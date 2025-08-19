import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

interface AdminScreenProps {
  navigation: any;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const navigateToDebug = () => {
    navigation.navigate('GraphQLDebug');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Admin Panel
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Administrative functions and settings
        </Text>
      </View>

      {/* User Info Card */}
      <View style={styles.content}>
        <Card style={styles.userCard}>
          <Card.Content style={styles.userCardContent}>
            <Avatar.Text
              size={50}
              label={
                user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
              }
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text variant="titleMedium" style={styles.userName}>
                {user?.name || 'User'}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user?.email}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">GraphQL Debug</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Debug GraphQL connection and schema issues
            </Text>
            <Button mode="contained" style={styles.button} onPress={navigateToDebug}>
              Open Debug Panel
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Database Management</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Manage properties, rooms, and inventory data
            </Text>
            <Button mode="contained" style={styles.button}>
              Open Database
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">User Management</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Manage user accounts and permissions
            </Text>
            <Button mode="contained" style={styles.button}>
              Manage Users
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">System Settings</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Configure system preferences and options
            </Text>
            <Button mode="contained" style={styles.button}>
              Settings
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Account</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Manage your account and logout
            </Text>
            <Button mode="outlined" style={styles.logoutButton} onPress={handleLogout}>
              Logout
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    color: '#666',
    lineHeight: 22,
  },
  content: {
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#6200ee',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  userEmail: {
    color: '#666',
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardText: {
    color: '#666',
    marginVertical: 8,
  },
  button: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: '#f44336',
    borderWidth: 2,
  },
});
