import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Card, TextInput, FAB, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROPERTIES, CREATE_PROPERTY } from '../graphql/queries';
import { CREATE_PROPERTY as CREATE_PROPERTY_MUTATION } from '../graphql/mutations';
import { Property, CreatePropertyInput } from '../graphql/types';
import { useGraphQL } from '../hooks/useGraphQL';

export const PropertyScreen: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyAddress, setNewPropertyAddress] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { useSafeQuery, useSafeMutation } = useGraphQL();

  // Fetch properties using the safe query hook
  const { data, loading, error, refetch } = useSafeQuery(GET_PROPERTIES);

  console.log('=== data ===', JSON.stringify(data, null, 2));

  // Create property mutation
  const [createProperty] = useSafeMutation(CREATE_PROPERTY_MUTATION, {
    onCompleted: () => {
      // Reset form and hide it
      setNewPropertyName('');
      setNewPropertyAddress('');
      setShowCreateForm(false);
      setIsCreating(false);

      // Refresh the properties list
      refetch();

      Alert.alert('Success', 'Property created successfully!');
    },
    onError: error => {
      setIsCreating(false);
      // Error is automatically handled by the safe mutation hook
    },
  });

  const handleCreateProperty = async () => {
    if (!newPropertyName.trim() || !newPropertyAddress.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsCreating(true);

    const input: CreatePropertyInput = {
      name: newPropertyName.trim(),
      address: newPropertyAddress.trim(),
    };

    try {
      await createProperty({
        variables: { input },
      });
    } catch (error) {
      // Error is handled in onError callback
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
        <Text variant="bodySmall" style={styles.propertyDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
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
          label="Property Name"
          value={newPropertyName}
          onChangeText={setNewPropertyName}
          mode="outlined"
          style={styles.input}
          disabled={isCreating}
        />

        <TextInput
          label="Address"
          value={newPropertyAddress}
          onChangeText={setNewPropertyAddress}
          mode="outlined"
          style={styles.input}
          disabled={isCreating}
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
          <Button onPress={() => refetch()}>Retry</Button>
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
  propertyDate: {
    color: '#999',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
