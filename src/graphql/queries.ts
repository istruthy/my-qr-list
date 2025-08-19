import { gql } from '@apollo/client';

// NOTE: Update these mutation names to match your actual GraphQL server schema
// Common alternatives are listed in comments

// Authentication mutations
export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

// Alternative mutation names you might need to use:
// - login
// - signIn
// - authenticate
// - userLogin

export const REGISTER_USER = gql`
  mutation RegisterUser($email: String!, $password: String!, $name: String!) {
    registerUser(email: $email, password: $password, name: $name) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

// Alternative mutation names you might need to use:
// - signUp
// - createUser
// - userRegister

// Property queries
export const GET_PROPERTIES = gql`
  query GetProperties {
    properties {
      id
      name
      address
      createdAt
      updatedAt
    }
  }
`;

// Alternative query names you might need to use:
// - properties
// - getAllProperties
// - propertyList

export const GET_PROPERTY = gql`
  query GetProperty($id: ID!) {
    property(id: $id) {
      id
      name
      address
      createdAt
      updatedAt
      rooms: lists {
        id
        name
        description
        barcode
        createdAt
        items {
          id
          name
          description
          quantity
          condition
          estimatedValue
          isCompleted
          createdAt
        }
      }
    }
  }
`;

// Alternative query names you might need to use:
// - property
// - getProperty
// - propertyById

// Room queries
export const GET_ROOM = gql`
  query GetRoom($id: ID!) {
    room(id: $id) {
      id
      name
      description
      propertyId
      createdAt
      updatedAt
      items {
        id
        name
        description
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// Alternative query names you might need to use:
// - room
// - getRoom
// - roomById

// List queries
export const GET_LISTS = gql`
  query GetLists {
    lists {
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

// Alternative query names you might need to use:
// - lists
// - getAllLists
// - listCollection

export const GET_LIST = gql`
  query GetList($id: ID!) {
    list(id: $id) {
      id
      title: name
      barcode
      createdAt
      updatedAt
      items {
        id
        name
        description
        quantity
        condition
        estimatedValue
        isCompleted
        createdAt
      }
    }
  }
`;

// Alternative query names you might need to use:
// - list
// - getList
// - listById

// Search queries
export const SEARCH_BY_BARCODE = gql`
  query SearchByBarcode($barcode: String!) {
    searchByBarcode(barcode: $barcode) {
      type
      id
      data
    }
  }
`;

// Alternative query names you might need to use:
// - searchBarcode
// - barcodeSearch
// - findByBarcode
