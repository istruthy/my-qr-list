# Account-Centric GraphQL Implementation

This document describes the new account-centric GraphQL implementation that replaces the previous user-centric model.

## 🏗️ Architecture Overview

The new system operates on an **Account-Centric Model** where:
- **Accounts** are the central entity that owns properties and data
- **Users** belong to accounts with specific roles (PRIMARY, ADMIN, USER)
- **Properties** belong to accounts, not individual users
- **Multiple users** can collaborate on shared resources within the same account

## 🔄 Key Changes from Previous Implementation

### Before (User-Centric)
- Properties were directly associated with users
- No account concept
- Simple user-property relationship

### After (Account-Centric)
- Properties are associated with accounts
- Users are members of accounts with roles
- Account context required for all operations
- Multi-user collaboration support

## 📱 Mobile App Integration

### 1. Account Context Management

The app automatically manages account context:

```typescript
import { useAccountContext } from '../contexts/AccountContext';

const MyComponent = () => {
  const { 
    currentAccountId, 
    currentAccount, 
    loading, 
    error 
  } = useAccountContext();
  
  // currentAccountId is automatically set to user's first account
  // No account switching needed - users work within their assigned account
};
```

### 2. Using GraphQL Hooks

All GraphQL operations now require account context:

```typescript
import { useProperties, useCreateProperty } from '../hooks/useGraphQL';

const PropertyList = () => {
  // Properties are automatically scoped to current account
  const { data, loading, error } = useProperties();
  
  // Creating properties automatically includes account context
  const { createProperty, loading: isCreating } = useCreateProperty();
  
  const handleCreate = async () => {
    await createProperty({
      variables: {
        input: {
          name: "My Property",
          address: "123 Main St",
          // accountId is automatically added
        }
      }
    });
  };
};
```

### 3. Account Context Flow

1. **User Login**: User authenticates through Supabase
2. **Account Detection**: App automatically detects user's account membership
3. **Context Setting**: Account context is set and persisted
4. **Data Operations**: All GraphQL operations use the account context

## 🚀 Available GraphQL Operations

### Queries
- `GET_ME` - Get current user with account memberships
- `GET_MY_ACCOUNTS` - Get all accounts user belongs to
- `GET_ACCOUNT` - Get specific account details
- `GET_PROPERTIES` - Get properties for current account
- `GET_PROPERTY` - Get specific property
- `GET_LISTS` - Get lists for a property
- `GET_ITEMS` - Get items for a list

### Mutations
- `CREATE_PROPERTY` - Create property in current account
- `CREATE_LIST` - Create list in a property
- `CREATE_ITEM` - Create item in a list
- `UPDATE_*` - Update operations for all entities
- `DELETE_*` - Delete operations for all entities
- `TOGGLE_ITEM_COMPLETION` - Toggle item completion status

## 🔧 Setup and Configuration

### 1. App.tsx Configuration

```typescript
import { AccountProvider } from './src/contexts/AccountContext';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AccountProvider>  {/* Provides account context */}
          <RootNavigator />
        </AccountProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
```

### 2. Apollo Client Configuration

The Apollo client is configured with:
- Account-aware caching policies
- Automatic error handling for authentication issues
- Rate limiting support with client ID headers

### 3. Account Context Provider

The `AccountProvider` automatically:
- Loads user's account information
- Sets account context on app start
- Persists account context to AsyncStorage
- Provides account context to all components

## 📊 Data Flow

### 1. Authentication Flow
```
User Login → Supabase Auth → GraphQL Context → Account Detection → Context Set
```

### 2. Data Operations Flow
```
Component → useGraphQL Hook → Account Context → GraphQL Query/Mutation → Cache Update
```

### 3. Account Context Persistence
```
App Start → Load Stored Context → GraphQL Query → Set Context → Persist to Storage
```

## 🎯 Usage Examples

### Creating a Property

```typescript
const CreatePropertyForm = () => {
  const { createProperty, loading } = useCreateProperty();
  
  const handleSubmit = async (formData) => {
    try {
      await createProperty({
        variables: {
          input: {
            name: formData.name,
            address: formData.address,
            description: formData.description,
            // accountId is automatically added
          }
        }
      });
    } catch (error) {
      console.error('Error creating property:', error);
    }
  };
};
```

### Fetching Properties

```typescript
const PropertyList = () => {
  const { data, loading, error } = useProperties();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <FlatList
      data={data?.properties || []}
      renderItem={({ item }) => <PropertyCard property={item} />}
    />
  );
};
```

### Working with Lists and Items

```typescript
const PropertyDetail = ({ propertyId }) => {
  const { data: propertyData } = useProperty(propertyId);
  const { data: listsData } = useLists(propertyId);
  
  return (
    <View>
      <Text>{propertyData?.property?.name}</Text>
      {listsData?.lists?.map(list => (
        <ListCard key={list.id} list={list} />
      ))}
    </View>
  );
};
```

## 🔒 Security and Access Control

### Account Isolation
- Users can only access data within their accounts
- No cross-account data access
- Properties are automatically scoped to account context

### Role-Based Permissions
- **PRIMARY**: Full account control
- **ADMIN**: Elevated access within account
- **USER**: Standard access to properties and data

### Authentication
- JWT tokens from Supabase Auth
- Automatic token refresh handling
- Secure API communication

## 🚨 Error Handling

### Common Error Scenarios
- **No Account Context**: User doesn't have access to any account
- **Authentication Required**: Invalid or expired JWT token
- **Access Denied**: User doesn't have permission for the operation
- **Network Errors**: Connection issues or API unavailability

### Error Handling in Components

```typescript
const MyComponent = () => {
  const { currentAccountId, error: accountError } = useAccountContext();
  const { data, error: dataError } = useProperties();
  
  if (accountError) {
    return <AccountError error={accountError} />;
  }
  
  if (!currentAccountId) {
    return <NoAccountAccess />;
  }
  
  if (dataError) {
    return <DataError error={dataError} />;
  }
  
  return <DataDisplay data={data} />;
};
```

## 🧪 Testing

### Testing Account Context

```typescript
// Mock account context for testing
const mockAccountContext = {
  currentAccountId: 'test-account-id',
  currentAccount: { id: 'test-account-id', name: 'Test Account' },
  loading: false,
  error: null,
};

// Wrap components with mock context
<AccountContext.Provider value={mockAccountContext}>
  <MyComponent />
</AccountContext.Provider>
```

### Testing GraphQL Hooks

```typescript
// Test that hooks respect account context
const { result } = renderHook(() => useProperties(), {
  wrapper: ({ children }) => (
    <AccountContext.Provider value={mockAccountContext}>
      {children}
    </AccountContext.Provider>
  ),
});

expect(result.current.data).toBeDefined();
```

## 📚 Migration Guide

### For Existing Components

1. **Replace old GraphQL imports**:
   ```typescript
   // Old
   import { useGraphQL } from '../hooks/useGraphQL';
   
   // New
   import { useProperties, useCreateProperty } from '../hooks/useGraphQL';
   ```

2. **Add account context**:
   ```typescript
   // Old
   const { data } = useQuery(GET_PROPERTIES);
   
   // New
   const { data } = useProperties(); // Automatically uses account context
   ```

3. **Update mutation calls**:
   ```typescript
   // Old
   createProperty({ variables: { input: { name, address } } });
   
   // New
   createProperty({ variables: { input: { name, address } } }); // accountId auto-added
   ```

### For New Components

1. **Import account context**:
   ```typescript
   import { useAccountContext } from '../contexts/AccountContext';
   ```

2. **Use appropriate GraphQL hooks**:
   ```typescript
   import { useProperties, useCreateProperty } from '../hooks/useGraphQL';
   ```

3. **Handle loading and error states**:
   ```typescript
   const { currentAccountId, loading: accountLoading } = useAccountContext();
   const { data, loading: dataLoading, error } = useProperties();
   ```

## 🔮 Future Enhancements

### Planned Features
- **Multi-account support**: Allow users to switch between accounts
- **Advanced permissions**: Granular role-based access control
- **Real-time updates**: WebSocket subscriptions for live data
- **Offline support**: Offline-first data management
- **Bulk operations**: Batch create/update/delete operations

### Extension Points
- **Custom hooks**: Create specialized hooks for specific use cases
- **Cache policies**: Customize Apollo cache behavior
- **Error boundaries**: Implement React error boundaries for GraphQL errors
- **Performance monitoring**: Add performance tracking for GraphQL operations

## 📖 Additional Resources

- [GraphQL Schema Reference](GRAPHQL_SCHEMA_REFERENCE.md)
- [GraphQL API Documentation](GRAPHQL_API.md)
- [Remote GraphQL Implementation](remote-gql-resolvers)
- [TypeScript Types](src/graphql/types.ts)
- [GraphQL Hooks](src/hooks/useGraphQL.ts)

---

**This implementation provides a robust, scalable foundation for multi-user collaboration while maintaining simplicity for single-account users.** 🚀
