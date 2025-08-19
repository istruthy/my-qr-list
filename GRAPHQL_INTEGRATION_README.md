# GraphQL Integration Guide

This document explains how to use the GraphQL integration with JWT authentication in your React Native app.

## Overview

The app now uses GraphQL instead of a local database, with JWT token-based authentication. All data is fetched from and sent to a GraphQL endpoint at `http://localhost:3000/api/graphql`.

## Architecture

### 1. Apollo Client Setup
- **File**: `src/lib/apollo-client.ts`
- **Features**: 
  - Automatic JWT token injection in headers
  - Error handling for authentication failures
  - Network error handling

### 2. Authentication Context
- **File**: `src/contexts/AuthContext.tsx`
- **Features**:
  - JWT token management
  - User state management
  - Automatic token persistence
  - Login/logout functionality

### 3. GraphQL Operations
- **Queries**: `src/graphql/queries.ts`
- **Mutations**: `src/graphql/mutations.ts`
- **Types**: `src/graphql/types.ts`

## Authentication Flow

### Login Screen
- **File**: `src/screens/LoginScreen.tsx`
- **Features**:
  - Email/password authentication
  - JWT token storage
  - Error handling for invalid credentials
  - Navigation to registration

### Registration Screen
- **File**: `src/screens/RegisterScreen.tsx`
- **Features**:
  - User account creation
  - Password confirmation
  - Validation
  - Automatic login after registration

### Authentication State
The app automatically shows either:
- **Auth Navigator**: Login/Register screens when not authenticated
- **Main App**: All app functionality when authenticated

## Using GraphQL in Components

### 1. Basic Query Example
```typescript
import { useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../graphql/queries';

const MyComponent = () => {
  const { data, loading, error } = useQuery(GET_PROPERTIES);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <View>
      {data.properties.map(property => (
        <Text key={property.id}>{property.name}</Text>
      ))}
    </View>
  );
};
```

### 2. Basic Mutation Example
```typescript
import { useMutation } from '@apollo/client';
import { CREATE_PROPERTY } from '../graphql/mutations';

const MyComponent = () => {
  const [createProperty, { loading }] = useMutation(CREATE_PROPERTY);
  
  const handleCreate = async () => {
    try {
      await createProperty({
        variables: {
          input: {
            name: 'New Property',
            address: '123 Main St'
          }
        }
      });
    } catch (error) {
      console.error('Error creating property:', error);
    }
  };
  
  return (
    <Button onPress={handleCreate} loading={loading}>
      Create Property
    </Button>
  );
};
```

### 3. Using the Custom Hook
```typescript
import { useGraphQL } from '../hooks/useGraphQL';

const MyComponent = () => {
  const { useSafeQuery, useSafeMutation } = useGraphQL();
  
  const { data, loading } = useSafeQuery(GET_PROPERTIES);
  const [createProperty] = useSafeMutation(CREATE_PROPERTY);
  
  // Errors are automatically handled with user-friendly alerts
};
```

## Available GraphQL Operations

### Authentication
- `LOGIN_USER`: User login
- `REGISTER_USER`: User registration

### Properties
- `GET_PROPERTIES`: Fetch all properties
- `GET_PROPERTY`: Fetch single property with rooms
- `CREATE_PROPERTY`: Create new property
- `UPDATE_PROPERTY`: Update existing property
- `DELETE_PROPERTY`: Delete property

### Rooms
- `GET_ROOM`: Fetch room with items
- `CREATE_ROOM`: Create new room
- `UPDATE_ROOM`: Update existing room
- `DELETE_ROOM`: Delete room

### Lists
- `GET_LISTS`: Fetch all lists
- `GET_LIST`: Fetch single list with items
- `CREATE_LIST`: Create new list
- `UPDATE_LIST`: Update existing list
- `DELETE_LIST`: Delete list

### List Items
- `CREATE_LIST_ITEM`: Add item to list
- `UPDATE_LIST_ITEM`: Update list item
- `DELETE_LIST_ITEM`: Remove item from list
- `TOGGLE_LIST_ITEM`: Toggle item completion

### Items (Room Items)
- `CREATE_ITEM`: Create new item
- `UPDATE_ITEM`: Update existing item
- `DELETE_ITEM`: Delete item

### Search
- `SEARCH_BY_BARCODE`: Search by barcode/QR code

## Type Safety

All GraphQL operations are fully typed with TypeScript interfaces:

```typescript
import { Property, CreatePropertyInput } from '../graphql/types';

// Fully typed variables
const [createProperty] = useMutation<{ createProperty: Property }, { input: CreatePropertyInput }>(
  CREATE_PROPERTY
);
```

## Error Handling

### Automatic Error Handling
- Authentication errors automatically redirect to login
- Network errors show user-friendly messages
- GraphQL errors are displayed with context

### Custom Error Handling
```typescript
const [createProperty] = useMutation(CREATE_PROPERTY, {
  onError: (error) => {
    // Custom error handling
    if (error.graphQLErrors?.[0]?.extensions?.code === 'VALIDATION_ERROR') {
      // Handle validation errors
    }
  }
});
```

## JWT Token Management

### Automatic Token Injection
- Tokens are automatically added to all GraphQL requests
- Stored securely in AsyncStorage
- Automatically cleared on logout or authentication errors

### Token Refresh
- Currently, tokens are not automatically refreshed
- Users must re-authenticate when tokens expire
- Future enhancement: implement token refresh logic

## Security Features

### Input Validation
- All user inputs are validated before sending to GraphQL
- Password requirements enforced
- Email format validation

### Secure Storage
- JWT tokens stored in AsyncStorage (consider upgrading to react-native-keychain for production)
- No sensitive data in component state
- Automatic token cleanup on logout

## Testing the Integration

### 1. Start Your GraphQL Server
Ensure your GraphQL server is running at `http://localhost:3000/api/graphql`

### 2. Test Authentication
- Try registering a new account
- Test login with valid credentials
- Verify logout functionality

### 3. Test GraphQL Operations
- Create a property
- Add rooms to properties
- Create lists and items
- Test search functionality

### 4. Test Error Scenarios
- Invalid credentials
- Network errors
- GraphQL validation errors

## Troubleshooting

### Common Issues

1. **Network Error**: Check if GraphQL server is running
2. **Authentication Error**: Verify JWT token format and expiration
3. **Type Errors**: Ensure GraphQL schema matches TypeScript types
4. **Navigation Issues**: Check authentication state in context

### Debug Mode
Enable Apollo Client dev tools for debugging:
```typescript
// In apollo-client.ts
const client = new ApolloClient({
  // ... other options
  connectToDevTools: __DEV__, // Enable in development
});
```

## Future Enhancements

1. **Token Refresh**: Implement automatic JWT token refresh
2. **Offline Support**: Add offline-first capabilities with Apollo Client cache
3. **Real-time Updates**: Implement GraphQL subscriptions
4. **Advanced Caching**: Optimize Apollo Client cache policies
5. **Error Boundaries**: Add React error boundaries for better error handling

## Dependencies

The following packages were added for GraphQL integration:

```json
{
  "@apollo/client": "^3.0.0",
  "graphql": "^16.0.0",
  "@react-native-async-storage/async-storage": "^1.0.0",
  "react-native-keychain": "^8.0.0"
}
```

## Migration Notes

### From Local Storage
- Replace `getAllLists()` with GraphQL queries
- Replace `deleteList()` with GraphQL mutations
- Update all data operations to use GraphQL

### From Drizzle ORM
- Remove database schema files
- Remove Drizzle dependencies
- Update all data access to use GraphQL

## Support

For issues or questions about the GraphQL integration:
1. Check the Apollo Client documentation
2. Verify GraphQL server status
3. Review authentication flow
4. Check network connectivity
