import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';

const httpLink = createHttpLink({
  uri: 'https://deploy-preview-3--host-inventory-sync.netlify.app/api/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  try {
    // Get the Supabase access token
    const supabaseToken = await AsyncStorage.getItem('supabaseAccessToken');

    if (supabaseToken) {
      console.log('Apollo Client: Using Supabase token for authentication');
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${supabaseToken}`,
          'x-client-id': 'mobile-app-v1',
        },
      };
    } else {
      console.log('Apollo Client: No authentication token found');
      return {
        headers: {
          ...headers,
          'x-client-id': 'mobile-app-v1',
        },
      };
    }
  } catch (error) {
    console.error('Apollo Client: Error getting auth token:', error);
    return {
      headers: {
        ...headers,
        'x-client-id': 'mobile-app-v1',
      },
    };
  }
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Extensions: ${JSON.stringify(extensions)}`
      );

      // Handle authentication errors
      if (message === 'Authentication required' || message.includes('Authentication')) {
        console.log('🔐 Authentication error detected, clearing tokens...');
        // Clear invalid tokens
        AsyncStorage.multiRemove(['supabaseAccessToken', 'user', 'authToken']);
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Add field policies for better caching
          properties: {
            merge: false, // Don't merge, replace
          },
          lists: {
            merge: false,
          },
          items: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
  // Enable schema introspection for debugging
  connectToDevTools: true,
});
