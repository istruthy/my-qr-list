import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateListScreen } from './src/screens/CreateListScreen';
import { ViewListScreen } from './src/screens/ViewListScreen';
import { ScanQRScreen } from './src/screens/ScanQRScreen';
import { RootStackParamList } from './src/types';
import * as Linking from 'expo-linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
  },
};

const prefix = Linking.createURL('/');

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer
        linking={{
          prefixes: [prefix, 'myqrlist://', 'https://myqrlist.app'],
          config: {
            screens: {
              Home: 'home',
              CreateList: 'create',
              ViewList: {
                path: 'list/:listId',
                parse: {
                  listId: (listId: string) => listId,
                },
              },
              ScanQR: 'scan',
            },
          },
        }}
      >
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'My QR Lists' }}
          />
          <Stack.Screen
            name="CreateList"
            component={CreateListScreen}
            options={{ title: 'Create New List' }}
          />
          <Stack.Screen
            name="ViewList"
            component={ViewListScreen}
            options={{ title: 'View List' }}
          />
          <Stack.Screen
            name="ScanQR"
            component={ScanQRScreen}
            options={{ title: 'Scan QR Code' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
