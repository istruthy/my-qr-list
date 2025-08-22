import { gql } from '@apollo/client';

// Account Management Mutations
export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($id: ID!, $input: UpdateAccountInput!) {
    updateAccount(id: $id, input: $input) {
      id
      name
      description
      updatedAt
    }
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($id: ID!) {
    deleteAccount(id: $id)
  }
`;

// Property Management Mutations
export const CREATE_PROPERTY = gql`
  mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(input: $input) {
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
    }
  }
`;

export const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($id: ID!, $input: UpdatePropertyInput!) {
    updateProperty(id: $id, input: $input) {
      id
      name
      address
      description
      barcode
      updatedAt
    }
  }
`;

export const DELETE_PROPERTY = gql`
  mutation DeleteProperty($id: ID!) {
    deleteProperty(id: $id)
  }
`;

// List Management Mutations
export const CREATE_LIST = gql`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
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
    }
  }
`;

export const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $input: UpdateListInput!) {
    updateList(id: $id, input: $input) {
      id
      name
      description
      barcode
      updatedAt
    }
  }
`;

export const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteList(id: $id)
  }
`;

// Item Management Mutations
export const CREATE_ITEM = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
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

export const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $input: UpdateItemInput!) {
    updateItem(id: $id, input: $input) {
      id
      name
      description
      quantity
      condition
      estimatedValue
      imageUrl
      barcode
      isCompleted
      updatedAt
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id)
  }
`;

export const TOGGLE_ITEM_COMPLETION = gql`
  mutation ToggleItemCompletion($id: ID!) {
    toggleItemCompletion(id: $id) {
      id
      name
      isCompleted
      updatedAt
    }
  }
`;

// User Management Mutations
export const INVITE_USER = gql`
  mutation InviteUser($input: InviteUserInput!) {
    inviteUser(input: $input) {
      id
      email
      role
      invitedBy {
        id
        name
      }
      expiresAt
      createdAt
    }
  }
`;

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($input: AcceptInvitationInput!) {
    acceptInvitation(input: $input) {
      id
      role
      isActive
      account {
        id
        name
      }
      user {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
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
`;

export const REMOVE_USER_FROM_ACCOUNT = gql`
  mutation RemoveUserFromAccount($accountId: ID!, $userId: ID!) {
    removeUserFromAccount(accountId: $accountId, userId: $userId)
  }
`;

// Barcode Management Mutations
export const UPDATE_ITEM_BARCODE = gql`
  mutation UpdateItemBarcode($id: ID!, $barcode: String!) {
    updateItemBarcode(id: $id, barcode: $barcode) {
      id
      name
      barcode
      updatedAt
    }
  }
`;

export const UPDATE_PROPERTY_BARCODE = gql`
  mutation UpdatePropertyBarcode($id: ID!, $barcode: String!) {
    updatePropertyBarcode(id: $id, barcode: $barcode) {
      id
      name
      barcode
      updatedAt
    }
  }
`;

export const UPDATE_LIST_BARCODE = gql`
  mutation UpdateListBarcode($id: ID!, $barcode: String!) {
    updateListBarcode(id: $id, barcode: $barcode) {
      id
      name
      barcode
      updatedAt
    }
  }
`;
