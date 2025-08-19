// GraphQL Configuration
// Update these values to match your actual GraphQL server schema

export const GRAPHQL_CONFIG = {
  // Authentication operations
  auth: {
    login: 'loginUser', // Change this to match your server (e.g., 'login', 'signIn', 'authenticate')
    register: 'registerUser', // Change this to match your server (e.g., 'signUp', 'createUser', 'userRegister')
  },

  // Property operations
  properties: {
    getAll: 'properties', // Change this to match your server (e.g., 'getAllProperties', 'propertyList')
    getById: 'property', // Change this to match your server (e.g., 'getProperty', 'propertyById')
    create: 'createProperty', // Change this to match your server
    update: 'updateProperty', // Change this to match your server
    delete: 'deleteProperty', // Change this to match your server
  },

  // Room operations
  rooms: {
    getById: 'room', // Change this to match your server (e.g., 'getRoom', 'roomById')
    create: 'createRoom', // Change this to match your server
    update: 'updateRoom', // Change this to match your server
    delete: 'deleteRoom', // Change this to match your server
  },

  // List operations
  lists: {
    getAll: 'lists', // Change this to match your server (e.g., 'getAllLists', 'listCollection')
    getById: 'list', // Change this to match your server (e.g., 'getList', 'listById')
    create: 'createList', // Change this to match your server
    update: 'updateList', // Change this to match your server
    delete: 'deleteList', // Change this to match your server
  },

  // List item operations
  listItems: {
    create: 'createListItem', // Change this to match your server
    update: 'updateListItem', // Change this to match your server
    delete: 'deleteListItem', // Change this to match your server
    toggle: 'toggleListItem', // Change this to match your server
  },

  // Item operations (room items)
  items: {
    create: 'createItem', // Change this to match your server
    update: 'updateItem', // Change this to match your server
    delete: 'deleteItem', // Change this to match your server
  },

  // Search operations
  search: {
    byBarcode: 'searchByBarcode', // Change this to match your server (e.g., 'searchBarcode', 'barcodeSearch')
  },
};

// Helper function to get operation names
export const getOperationName = (
  category: keyof typeof GRAPHQL_CONFIG,
  operation: string
): string => {
  const categoryConfig = GRAPHQL_CONFIG[category] as Record<string, string>;
  return categoryConfig[operation] || operation;
};

// Example usage:
// const loginMutationName = getOperationName('auth', 'login');
// const propertiesQueryName = getOperationName('properties', 'getAll');
