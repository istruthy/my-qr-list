import { gql } from '@apollo/client';

// Property mutations
export const CREATE_PROPERTY = gql`
  mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(input: $input) {
      id
      name
      address
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($id: ID!, $input: UpdatePropertyInput!) {
    updateProperty(id: $id, input: $input) {
      id
      name
      address
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PROPERTY = gql`
  mutation DeleteProperty($id: ID!) {
    deleteProperty(id: $id)
  }
`;

// Room mutations
export const CREATE_ROOM = gql`
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
      id
      name
      description
      propertyId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ROOM = gql`
  mutation UpdateRoom($id: ID!, $input: UpdateRoomInput!) {
    updateRoom(id: $id, input: $input) {
      id
      name
      description
      propertyId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_ROOM = gql`
  mutation DeleteRoom($id: ID!) {
    deleteRoom(id: $id)
  }
`;

// List mutations
export const CREATE_LIST = gql`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
      id
      title
      barcode
      createdAt
      updatedAt
      items {
        id
        text
        completed
        createdAt
        imageUrl
      }
    }
  }
`;

export const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $input: UpdateListInput!) {
    updateList(id: $id, input: $input) {
      id
      title
      barcode
      createdAt
      updatedAt
      items {
        id
        text
        completed
        createdAt
        imageUrl
      }
    }
  }
`;

export const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteList(id: $id)
  }
`;

// List item mutations
export const CREATE_LIST_ITEM = gql`
  mutation CreateListItem($input: CreateListItemInput!) {
    createListItem(input: $input) {
      id
      text
      completed
      createdAt
      imageUrl
    }
  }
`;

export const UPDATE_LIST_ITEM = gql`
  mutation UpdateListItem($id: ID!, $input: UpdateListItemInput!) {
    updateListItem(id: $id, input: $input) {
      id
      text
      completed
      createdAt
      imageUrl
    }
  }
`;

export const DELETE_LIST_ITEM = gql`
  mutation DeleteListItem($id: ID!) {
    deleteListItem(id: $id)
  }
`;

export const TOGGLE_LIST_ITEM = gql`
  mutation ToggleListItem($id: ID!) {
    toggleListItem(id: $id) {
      id
      text
      completed
      createdAt
      imageUrl
    }
  }
`;

// Item mutations (for room items)
export const CREATE_ITEM = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      id
      name
      description
      status
      roomId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $input: UpdateItemInput!) {
    updateItem(id: $id, input: $input) {
      id
      name
      description
      status
      roomId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id)
  }
`;
