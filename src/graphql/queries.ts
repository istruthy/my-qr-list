import { gql } from '@apollo/client';

// Get current user information
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      createdAt
      updatedAt
      accounts {
        id
        role
        isActive
        account {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    }
  }
`;

// Get user's accounts
export const GET_MY_ACCOUNTS = gql`
  query GetMyAccounts {
    myAccounts {
      id
      name
      description
      createdAt
      updatedAt
      properties {
        id
        name
        address
        description
        barcode
        createdAt
        updatedAt
      }
      accountUsers {
        id
        role
        isActive
        user {
          id
          name
          email
        }
      }
    }
  }
`;

// Get account details
export const GET_ACCOUNT = gql`
  query GetAccount($id: ID!) {
    account(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      properties {
        id
        name
        address
        description
        barcode
        createdAt
        updatedAt
      }
      accountUsers {
        id
        role
        isActive
        user {
          id
          name
          email
        }
      }
      invitations {
        id
        email
        role
        isAccepted
        expiresAt
        createdAt
      }
    }
  }
`;

// Get properties for an account
export const GET_PROPERTIES = gql`
  query GetProperties($accountId: ID!) {
    properties(accountId: $accountId) {
      id
      name
      address
      description
      barcode
      createdAt
      updatedAt
      lists {
        id
        name
        description
        barcode
        createdAt
        updatedAt
        items {
          id
          name
          quantity
          condition
          isCompleted
        }
      }
    }
  }
`;

// Get property details
export const GET_PROPERTY = gql`
  query GetProperty($id: ID!) {
    property(id: $id) {
      id
      name
      address
      description
      barcode
      createdAt
      updatedAt
      account {
        id
        name
      }
      lists {
        id
        name
        description
        barcode
        createdAt
        updatedAt
        items {
          id
          name
          quantity
          condition
          isCompleted
        }
      }
    }
  }
`;

// Get property by barcode
export const GET_PROPERTY_BY_BARCODE = gql`
  query GetPropertyByBarcode($accountId: ID!, $barcode: String!) {
    propertyByBarcode(accountId: $accountId, barcode: $barcode) {
      id
      name
      address
      description
      barcode
      createdAt
      updatedAt
      account {
        id
        name
      }
      lists {
        id
        name
        description
        barcode
        createdAt
        updatedAt
      }
    }
  }
`;

// Get lists for a property
export const GET_LISTS = gql`
  query GetLists($propertyId: ID!) {
    lists(propertyId: $propertyId) {
      id
      name
      description
      barcode
      createdAt
      updatedAt
      property {
        id
        name
        account {
          id
          name
        }
      }
      items {
        id
        name
        quantity
        condition
        isCompleted
      }
    }
  }
`;

// Get list details
export const GET_LIST = gql`
  query GetList($id: ID!) {
    list(id: $id) {
      id
      name
      description
      barcode
      createdAt
      updatedAt
      property {
        id
        name
        account {
          id
          name
        }
      }
      items {
        id
        name
        quantity
        condition
        isCompleted
        estimatedValue
        imageUrl
        barcode
        createdAt
        updatedAt
      }
    }
  }
`;

// Get list by barcode
export const GET_LIST_BY_BARCODE = gql`
  query GetListByBarcode($accountId: ID!, $barcode: String!) {
    listByBarcode(accountId: $accountId, barcode: $barcode) {
      id
      name
      description
      barcode
      createdAt
      updatedAt
      property {
        id
        name
        account {
          id
          name
        }
      }
      items {
        id
        name
        quantity
        condition
        isCompleted
      }
    }
  }
`;

// Get items for a list
export const GET_ITEMS = gql`
  query GetItems($listId: ID!) {
    items(listId: $listId) {
      id
      name
      description
      quantity
      condition
      estimatedValue
      imageUrl
      barcode
      isCompleted
      createdAt
      updatedAt
    }
  }
`;

// Get item details
export const GET_ITEM = gql`
  query GetItem($id: ID!) {
    item(id: $id) {
      id
      name
      description
      quantity
      condition
      estimatedValue
      imageUrl
      barcode
      isCompleted
      createdAt
      updatedAt
      list {
        id
        name
        property {
          id
          name
          account {
            id
            name
          }
        }
      }
    }
  }
`;

// Get item by barcode
export const GET_ITEM_BY_BARCODE = gql`
  query GetItemByBarcode($accountId: ID!, $barcode: String!) {
    itemByBarcode(accountId: $accountId, barcode: $barcode) {
      id
      name
      description
      quantity
      condition
      estimatedValue
      imageUrl
      barcode
      isCompleted
      createdAt
      updatedAt
      list {
        id
        name
        property {
          id
          name
          account {
            id
            name
          }
        }
      }
    }
  }
`;

// Get items by condition
export const GET_ITEMS_BY_CONDITION = gql`
  query GetItemsByCondition($accountId: ID!, $condition: ItemCondition!) {
    itemsByCondition(accountId: $accountId, condition: $condition) {
      id
      name
      description
      quantity
      condition
      estimatedValue
      imageUrl
      barcode
      isCompleted
      createdAt
      updatedAt
      list {
        id
        name
        property {
          id
          name
          account {
            id
            name
          }
        }
      }
    }
  }
`;

// Get pending invitations for an account
export const GET_PENDING_INVITATIONS = gql`
  query GetPendingInvitations($accountId: ID!) {
    pendingInvitations(accountId: $accountId) {
      id
      email
      role
      invitedBy {
        id
        name
      }
      expiresAt
      isAccepted
      createdAt
    }
  }
`;

// Get invitation by token
export const GET_INVITATION_BY_TOKEN = gql`
  query GetInvitationByToken($token: String!) {
    invitationByToken(token: $token) {
      id
      email
      role
      account {
        id
        name
      }
      invitedBy {
        id
        name
      }
      expiresAt
      isAccepted
      createdAt
    }
  }
`;
