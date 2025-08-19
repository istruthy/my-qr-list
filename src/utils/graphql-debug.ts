import { client } from '../lib/apollo-client';

// Introspection query to get the full GraphQL schema
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType {
        name
        fields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
      mutationType {
        name
        fields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
      types {
        name
        description
        fields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  }
`;

export const debugGraphQLSchema = async () => {
  try {
    console.log('🔍 Fetching GraphQL schema...');

    const result = await client.query({
      query: { kind: 'Document', definitions: [] }, // Placeholder
      errorPolicy: 'all',
    });

    console.log('✅ GraphQL connection successful');
    console.log('📊 Available queries and mutations:');

    // This is a simplified approach - in practice you'd parse the introspection result
    console.log(
      '💡 Tip: Visit http://localhost:3000/api/graphql in your browser to see the schema'
    );
  } catch (error: any) {
    console.error('❌ GraphQL connection failed:', error);

    if (error.networkError) {
      console.error('🌐 Network error - check if your GraphQL server is running');
      console.error('🔗 Expected endpoint: http://localhost:3000/api/graphql');
    }

    if (error.graphQLErrors) {
      console.error('📝 GraphQL errors:', error.graphQLErrors);
    }
  }
};

// Test basic connectivity
export const testGraphQLConnection = async () => {
  try {
    console.log('🧪 Testing GraphQL connection...');

    // Try a simple query to test connectivity
    const result = await client.query({
      query: { kind: 'Document', definitions: [] }, // Placeholder
      errorPolicy: 'all',
    });

    console.log('✅ Connection test successful');
    return true;
  } catch (error: any) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

// Get available operations (this would need to be customized based on your schema)
export const getAvailableOperations = () => {
  return {
    queries: [
      'properties', // Common alternatives
      'property',
      'rooms',
      'room',
      'lists',
      'list',
      'users',
      'user',
    ],
    mutations: [
      'login', // Common alternatives
      'signIn',
      'signUp',
      'createUser',
      'createProperty',
      'createRoom',
      'createList',
      'updateProperty',
      'deleteProperty',
    ],
  };
};
