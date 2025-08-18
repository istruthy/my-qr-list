import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AdminScreen: React.FC = () => {
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

      <View style={styles.content}>
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
});
