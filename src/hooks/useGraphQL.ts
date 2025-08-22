import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccountContext } from '../contexts/AccountContext';
import {
  GET_ME,
  GET_MY_ACCOUNTS,
  GET_ACCOUNT,
  GET_PROPERTIES,
  GET_PROPERTY,
  GET_LISTS,
  GET_LIST,
  GET_ITEMS,
  GET_ITEM,
} from '../graphql/queries';
import {
  CREATE_PROPERTY,
  CREATE_LIST,
  CREATE_ITEM,
  UPDATE_PROPERTY,
  UPDATE_LIST,
  UPDATE_ITEM,
  DELETE_PROPERTY,
  DELETE_LIST,
  DELETE_ITEM,
  TOGGLE_ITEM_COMPLETION,
  INVITE_USER,
  ACCEPT_INVITATION,
  UPDATE_USER_ROLE,
  REMOVE_USER_FROM_ACCOUNT,
} from '../graphql/mutations';
import type {
  User,
  Account,
  Property,
  List,
  Item,
  CreatePropertyInput,
  CreateListInput,
  CreateItemInput,
  UpdatePropertyInput,
  UpdateListInput,
  UpdateItemInput,
  InviteUserInput,
  AcceptInvitationInput,
  UpdateUserRoleInput,
} from '../graphql/types';

// Property hooks
export const useProperties = (accountId?: string) => {
  const { currentAccountId } = useAccountContext();
  const targetAccountId = accountId || currentAccountId;

  console.log('🔍 useProperties hook debug:');
  console.log('  - accountId parameter:', accountId);
  console.log('  - currentAccountId from context:', currentAccountId);
  console.log('  - targetAccountId:', targetAccountId);
  console.log('  - Will skip query:', !targetAccountId);

  return useQuery(GET_PROPERTIES, {
    variables: { accountId: targetAccountId! },
    skip: !targetAccountId,
  });
};

export const useProperty = (id: string) => {
  return useQuery(GET_PROPERTY, {
    variables: { id },
  });
};

export const useCreateProperty = () => {
  const client = useApolloClient();
  const { currentAccountId } = useAccountContext();

  const [createProperty, { loading, error }] = useMutation(CREATE_PROPERTY, {
    onCompleted: data => {
      // Update the properties cache
      if (currentAccountId) {
        client.cache.modify({
          fields: {
            properties(existingProperties = [], { readField }) {
              const newProperty = client.cache.writeFragment({
                data: data.createProperty,
                fragment: GET_PROPERTY,
              });
              return [...existingProperties, newProperty];
            },
          },
        });
      }
    },
  });

  const createPropertyWithAccount = useCallback(
    (input: Omit<CreatePropertyInput, 'accountId'>) => {
      if (!currentAccountId) {
        throw new Error('No account context set');
      }
      return createProperty({
        variables: {
          input: {
            ...input,
            accountId: currentAccountId,
          },
        },
      });
    },
    [createProperty, currentAccountId]
  );

  return {
    createProperty: createPropertyWithAccount,
    loading,
    error,
  };
};

export const useUpdateProperty = () => {
  const client = useApolloClient();

  const [updateProperty, { loading, error }] = useMutation(UPDATE_PROPERTY, {
    onCompleted: data => {
      // Update the property in cache
      client.cache.modify({
        id: client.cache.identify(data.updateProperty),
        fields: {
          name: () => data.updateProperty.name,
          address: () => data.updateProperty.address,
          description: () => data.updateProperty.description,
          barcode: () => data.updateProperty.barcode,
          updatedAt: () => data.updateProperty.updatedAt,
        },
      });
    },
  });

  return { updateProperty, loading, error };
};

export const useDeleteProperty = () => {
  const client = useApolloClient();

  const [deleteProperty, { loading, error }] = useMutation(DELETE_PROPERTY, {
    onCompleted: data => {
      // Remove the property from cache by evicting it
      if (data?.deleteProperty) {
        // Since we don't have the ID in onCompleted, we'll need to handle this differently
        // The cache will be updated when the component re-renders
      }
    },
  });

  return { deleteProperty, loading, error };
};

// List hooks
export const useLists = (propertyId: string) => {
  return useQuery(GET_LISTS, {
    variables: { propertyId },
  });
};

export const useList = (id: string) => {
  return useQuery(GET_LIST, {
    variables: { id },
  });
};

export const useCreateList = () => {
  const client = useApolloClient();

  const [createList, { loading, error }] = useMutation(CREATE_LIST, {
    onCompleted: data => {
      // Update the lists cache
      client.cache.modify({
        fields: {
          lists(existingLists = [], { readField }) {
            const newList = client.cache.writeFragment({
              data: data.createList,
              fragment: GET_LIST,
            });
            return [...existingLists, newList];
          },
        },
      });
    },
  });

  return { createList, loading, error };
};

export const useUpdateList = () => {
  const client = useApolloClient();

  const [updateList, { loading, error }] = useMutation(UPDATE_LIST, {
    onCompleted: data => {
      // Update the list in cache
      client.cache.modify({
        id: client.cache.identify(data.updateList),
        fields: {
          name: () => data.updateList.name,
          description: () => data.updateList.description,
          barcode: () => data.updateList.barcode,
          updatedAt: () => data.updateList.updatedAt,
        },
      });
    },
  });

  return { updateList, loading, error };
};

export const useDeleteList = () => {
  const client = useApolloClient();

  const [deleteList, { loading, error }] = useMutation(DELETE_LIST, {
    onCompleted: data => {
      // The cache will be updated when the component re-renders
    },
  });

  return { deleteList, loading, error };
};

// Item hooks
export const useItems = (listId: string) => {
  return useQuery(GET_ITEMS, {
    variables: { listId },
  });
};

export const useItem = (id: string) => {
  return useQuery(GET_ITEM, {
    variables: { id },
  });
};

export const useCreateItem = () => {
  const client = useApolloClient();

  const [createItem, { loading, error }] = useMutation(CREATE_ITEM, {
    onCompleted: data => {
      // Update the items cache
      client.cache.modify({
        fields: {
          items(existingItems = [], { readField }) {
            const newItem = client.cache.writeFragment({
              data: data.createItem,
              fragment: GET_ITEM,
            });
            return [...existingItems, newItem];
          },
        },
      });
    },
  });

  return { createItem, loading, error };
};

export const useUpdateItem = () => {
  const client = useApolloClient();

  const [updateItem, { loading, error }] = useMutation(UPDATE_ITEM, {
    onCompleted: data => {
      // Update the item in cache
      client.cache.modify({
        id: client.cache.identify(data.updateItem),
        fields: {
          name: () => data.updateItem.name,
          description: () => data.updateItem.description,
          quantity: () => data.updateItem.quantity,
          condition: () => data.updateItem.condition,
          estimatedValue: () => data.updateItem.estimatedValue,
          imageUrl: () => data.updateItem.imageUrl,
          barcode: () => data.updateItem.barcode,
          isCompleted: () => data.updateItem.isCompleted,
          updatedAt: () => data.updateItem.updatedAt,
        },
      });
    },
  });

  return { updateItem, loading, error };
};

export const useDeleteItem = () => {
  const client = useApolloClient();

  const [deleteItem, { loading, error }] = useMutation(DELETE_ITEM, {
    onCompleted: data => {
      // The cache will be updated when the component re-renders
    },
  });

  return { deleteItem, loading, error };
};

export const useToggleItemCompletion = () => {
  const client = useApolloClient();

  const [toggleItemCompletion, { loading, error }] = useMutation(TOGGLE_ITEM_COMPLETION, {
    onCompleted: data => {
      // Update the item completion status in cache
      client.cache.modify({
        id: client.cache.identify(data.toggleItemCompletion),
        fields: {
          isCompleted: () => data.toggleItemCompletion.isCompleted,
          updatedAt: () => data.toggleItemCompletion.updatedAt,
        },
      });
    },
  });

  return { toggleItemCompletion, loading, error };
};

// User management hooks
export const useInviteUser = () => {
  const [inviteUser, { loading, error }] = useMutation(INVITE_USER);
  return { inviteUser, loading, error };
};

export const useAcceptInvitation = () => {
  const [acceptInvitation, { loading, error }] = useMutation(ACCEPT_INVITATION);
  return { acceptInvitation, loading, error };
};

export const useUpdateUserRole = () => {
  const [updateUserRole, { loading, error }] = useMutation(UPDATE_USER_ROLE);
  return { updateUserRole, loading, error };
};

export const useRemoveUserFromAccount = () => {
  const [removeUserFromAccount, { loading, error }] = useMutation(REMOVE_USER_FROM_ACCOUNT);
  return { removeUserFromAccount, loading, error };
};

// Utility function to get account context from storage
export const getStoredAccountContext = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('currentAccountId');
  } catch (error) {
    console.error('Error getting stored account context:', error);
    return null;
  }
};

// Utility function to store account context
export const storeAccountContext = async (accountId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('currentAccountId', accountId);
  } catch (error) {
    console.error('Error storing account context:', error);
  }
};

// Utility function to clear stored account context
export const clearStoredAccountContext = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('currentAccountId');
  } catch (error) {
    console.error('Error clearing stored account context:', error);
  }
};
