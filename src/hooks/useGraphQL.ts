import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { Alert } from 'react-native';

export const useGraphQL = () => {
  const handleError = (error: ApolloError, title: string = 'Error') => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      if (graphQLError.extensions?.code === 'UNAUTHENTICATED') {
        message = 'You are not authenticated. Please login again.';
      } else if (graphQLError.extensions?.code === 'FORBIDDEN') {
        message = 'You do not have permission to perform this action.';
      } else if (graphQLError.message) {
        message = graphQLError.message;
      }
    } else if (error.networkError) {
      message = 'Network error. Please check your connection and try again.';
    }

    Alert.alert(title, message);
  };

  const useSafeQuery = <TData, TVariables>(
    query: any,
    options?: {
      variables?: TVariables;
      skip?: boolean;
      onError?: (error: ApolloError) => void;
    }
  ) => {
    return useQuery<TData, TVariables>(query, {
      ...options,
      onError: error => {
        if (options?.onError) {
          options.onError(error);
        } else {
          handleError(error, 'Query Error');
        }
      },
    });
  };

  const useSafeMutation = <TData, TVariables>(
    mutation: any,
    options?: {
      onCompleted?: (data: TData) => void;
      onError?: (error: ApolloError) => void;
    }
  ) => {
    return useMutation<TData, TVariables>(mutation, {
      ...options,
      onError: error => {
        if (options?.onError) {
          options.onError(error);
        } else {
          handleError(error, 'Mutation Error');
        }
      },
    });
  };

  return {
    useSafeQuery,
    useSafeMutation,
    handleError,
  };
};
