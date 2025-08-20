import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { client } from './src/lib/apollo-client';
import { AuthProvider } from './src/contexts/AuthContext';
import { GrowthBookProvider } from './src/contexts/GrowthBookProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
  },
};

export default function App() {
  return (
    <GrowthBookProvider>
      <ApolloProvider client={client}>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </PaperProvider>
      </ApolloProvider>
    </GrowthBookProvider>
  );
}
