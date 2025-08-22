import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Card, TextInput, FAB, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccountContext } from '../contexts/AccountContext';
import { useProperties, useCreateProperty } from '../hooks/useGraphQL';
import { Property, CreatePropertyInput } from '../graphql/types';

export const PropertyScreen: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyAddress, setNewPropertyAddress] = useState('');
  const [newPropertyDescription, setNewPropertyDescription] = useState('');

  // Get account context
  const { currentAccountId, currentAccount, loading: accountLoading } = useAccountContext();

  // Fetch properties for the current account
  const { data, loading, error, refetch } = useProperties();

  // Create property mutation
  const { createProperty, loading: isCreating } = useCreateProperty();

  const handleCreateProperty = async () => {
    if (!newPropertyName.trim() || !newPropertyAddress.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentAccountId) {
      Alert.alert('Error', 'No account context available');
      return;
    }

    const input: Omit<CreatePropertyInput, 'accountId'> = {
      name: newPropertyName.trim(),
      address: newPropertyAddress.trim(),
      description: newPropertyDescription.trim() || undefined,
    };

    try {
      await createProperty(input);

      // Reset form and hide it
      setNewPropertyName('');
      setNewPropertyAddress('');
      setNewPropertyDescription('');
      setShowCreateForm(false);

      Alert.alert('Success', 'Property created successfully!');
    } catch (error) {
      console.error('Error creating property:', error);
      Alert.alert('Error', 'Failed to create property. Please try again.');
    }
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <Card style={styles.propertyCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.propertyName}>
          {item.name}
        </Text>
        <Text variant="bodyMedium" style={styles.propertyAddress}>
          {item.address}
        </Text>
        {item.description && (
          <Text variant="bodyMedium" style={styles.propertyDescription}>
            {item.description}
          </Text>
        )}
        <Text variant="bodySmall" style={styles.propertyDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.lists && item.lists.length > 0 && (
          <Text variant="bodySmall" style={styles.propertyLists}>
            {item.lists.length} list{item.lists.length !== 1 ? 's' : ''}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderCreateForm = () => (
    <Card style={styles.createFormCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.formTitle}>
          Create New Property
        </Text>

        <TextInput
          label="Property Name *"
          value={newPropertyName}
          onChangeText={setNewPropertyName}
          mode="outlined"
          style={styles.input}
          disabled={isCreating}
        />

        <TextInput
          label="Address *"
          value={newPropertyAddress}
          onChangeText={setNewPropertyAddress}
          mode="outlined"
          style={styles.input}
          disabled={isCreating}
        />

        <TextInput
          label="Description (optional)"
          value={newPropertyDescription}
          onChangeText={setNewPropertyDescription}
          mode="outlined"
          style={styles.input}
          disabled={isCreating}
          multiline
          numberOfLines={3}
        />

        <View style={styles.formButtons}>
          <Button
            mode="outlined"
            onPress={() => setShowCreateForm(false)}
            disabled={isCreating}
            style={styles.cancelButton}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            onPress={handleCreateProperty}
            loading={isCreating}
            disabled={isCreating}
            style={styles.createButton}
          >
            Create Property
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Show loading state while account context is loading
  if (accountLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if no account context
  if (!currentAccountId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>No account available</Text>
          <Text variant="bodySmall" style={styles.errorText}>
            Please ensure you have access to an account
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading properties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Error loading properties</Text>
          <Text variant="bodySmall" style={styles.errorText}>
            {error.message}
          </Text>
          <Button onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const properties = data?.properties || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Properties
        </Text>
        {currentAccount && (
          <Text variant="bodyMedium" style={styles.accountName}>
            {currentAccount.name}
          </Text>
        )}
        <Text variant="bodyMedium" style={styles.subtitle}>
          {properties.length} property{properties.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {showCreateForm && renderCreateForm()}

      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon={showCreateForm ? 'close' : 'plus'}
        style={styles.fab}
        onPress={() => setShowCreateForm(!showCreateForm)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  accountName: {
    color: '#6200ee',
    fontWeight: '500',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  createFormCard: {
    margin: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  formTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    flex: 1,
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  propertyCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  propertyName: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  propertyAddress: {
    marginBottom: 8,
    color: '#666',
  },
  propertyDescription: {
    marginBottom: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  propertyDate: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  propertyLists: {
    color: '#6200ee',
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
});
