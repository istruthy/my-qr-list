import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Title, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testGraphQLConnection, getAvailableOperations } from '../utils/graphql-debug';
import { authService } from '../services/auth-service';
import { GRAPHQL_CONFIG } from '../config/graphql-config';

export const GraphQLDebugScreen: React.FC = () => {
  const [graphqlStatus, setGraphqlStatus] = useState<string>('Not tested');
  const [restStatus, setRestStatus] = useState<string>('Not tested');
  const [isTestingGraphQL, setIsTestingGraphQL] = useState(false);
  const [isTestingREST, setIsTestingREST] = useState(false);

  const testGraphQLConnectionLocal = async () => {
    setIsTestingGraphQL(true);
    setGraphqlStatus('Testing...');

    try {
      const isConnected = await testGraphQLConnection();
      setGraphqlStatus(isConnected ? '✅ Connected' : '❌ Failed');
    } catch (error) {
      setGraphqlStatus('❌ Error occurred');
      console.error('GraphQL connection test error:', error);
    } finally {
      setIsTestingGraphQL(false);
    }
  };

  const testRESTConnection = async () => {
    setIsTestingREST(true);
    setRestStatus('Testing...');

    try {
      const isConnected = await authService.testConnection();
      setRestStatus(isConnected ? '✅ Connected' : '❌ Failed');
    } catch (error) {
      setRestStatus('❌ Error occurred');
      console.error('REST connection test error:', error);
    } finally {
      setIsTestingREST(false);
    }
  };

  const showConfig = () => {
    Alert.alert(
      'GraphQL Configuration',
      `Current configuration:\n\n` +
        `Properties: ${GRAPHQL_CONFIG.properties.getAll}\n` +
        `Property: ${GRAPHQL_CONFIG.properties.getById}\n\n` +
        `Note: Authentication now uses REST endpoints:\n` +
        `- Login: POST /api/auth/login\n` +
        `- Register: POST /api/auth/register\n\n` +
        `Update src/config/graphql-config.ts to match your server schema.`,
      [{ text: 'OK' }]
    );
  };

  const operations = getAvailableOperations();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Title style={styles.title}>Debug Panel</Title>

        {/* Authentication Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>🔐 Authentication (REST)</Title>
            <Paragraph>Authentication now uses REST endpoints instead of GraphQL:</Paragraph>
            <Text style={styles.endpointItem}>• Login: POST /api/auth/login</Text>
            <Text style={styles.endpointItem}>• Register: POST /api/auth/register</Text>
            <Text style={styles.endpointItem}>• Base URL: http://localhost:3000/api</Text>
          </Card.Content>
        </Card>

        {/* REST Connection Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>🌐 REST Authentication Connection</Title>
            <Paragraph>Status: {restStatus}</Paragraph>
            <Button
              mode="contained"
              onPress={testRESTConnection}
              loading={isTestingREST}
              disabled={isTestingREST}
              style={styles.button}
            >
              Test REST Connection
            </Button>
          </Card.Content>
        </Card>

        {/* GraphQL Connection Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>📊 GraphQL Connection</Title>
            <Paragraph>Status: {graphqlStatus}</Paragraph>
            <Button
              mode="contained"
              onPress={testGraphQLConnectionLocal}
              loading={isTestingGraphQL}
              disabled={isTestingGraphQL}
              style={styles.button}
            >
              Test GraphQL Connection
            </Button>
          </Card.Content>
        </Card>

        {/* Configuration */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Current Configuration</Title>
            <Paragraph>
              The app is currently configured to use these GraphQL operation names. Update them in
              the config file to match your server.
            </Paragraph>
            <Button mode="outlined" onPress={showConfig} style={styles.button}>
              View Configuration
            </Button>
          </Card.Content>
        </Card>

        {/* Expected Operations */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Expected GraphQL Operations</Title>
            <Paragraph>Your GraphQL server should have these operations:</Paragraph>

            <Text style={styles.sectionTitle}>Queries:</Text>
            {operations.queries.map((query, index) => (
              <Text key={index} style={styles.operationItem}>
                • {query}
              </Text>
            ))}

            <Text style={styles.sectionTitle}>Mutations:</Text>
            {operations.mutations.map((mutation, index) => (
              <Text key={index} style={styles.operationItem}>
                • {mutation}
              </Text>
            ))}
          </Card.Content>
        </Card>

        {/* Troubleshooting */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Troubleshooting</Title>
            <Paragraph>If you're getting errors:</Paragraph>
            <Text style={styles.troubleshootItem}>1. Check if your server is running</Text>
            <Text style={styles.troubleshootItem}>
              2. Verify the GraphQL endpoint: http://localhost:3000/api/graphql
            </Text>
            <Text style={styles.troubleshootItem}>
              3. Verify the REST auth endpoint: http://localhost:3000/api/auth/login
            </Text>
            <Text style={styles.troubleshootItem}>
              4. Visit the GraphQL endpoint in your browser to see the schema
            </Text>
            <Text style={styles.troubleshootItem}>
              5. Update the config file with correct operation names
            </Text>
            <Text style={styles.troubleshootItem}>
              6. Check the console for detailed error messages
            </Text>
          </Card.Content>
        </Card>

        {/* Next Steps */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Next Steps</Title>
            <Paragraph>To complete the setup:</Paragraph>
            <Text style={styles.stepItem}>1. Ensure your REST auth endpoints are working</Text>
            <Text style={styles.stepItem}>
              2. Update GraphQL operation names in src/config/graphql-config.ts
            </Text>
            <Text style={styles.stepItem}>3. Test authentication flow</Text>
            <Text style={styles.stepItem}>4. Test GraphQL operations</Text>
            <Text style={styles.stepItem}>5. Restart the app and test again</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  button: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  operationItem: {
    marginLeft: 16,
    marginBottom: 4,
    color: '#666',
  },
  troubleshootItem: {
    marginLeft: 16,
    marginBottom: 4,
    color: '#666',
  },
  stepItem: {
    marginLeft: 16,
    marginBottom: 4,
    color: '#666',
  },
  endpointItem: {
    marginLeft: 16,
    marginBottom: 4,
    color: '#666',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
