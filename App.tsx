import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme, IconButton } from 'react-native-paper';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { CreateListScreen } from './src/screens/CreateListScreen';
import { ViewListScreen } from './src/screens/ViewListScreen';
import { ScanQRScreen } from './src/screens/ScanQRScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
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
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateList"
            component={CreateListScreen}
            options={{ title: 'Create New List' }}
          />
          <Stack.Screen
            name="ViewList"
            component={ViewListScreen}
            options={{
              headerTitle: '',
              headerBackTitle: ' ',
            }}
          />
          <Stack.Screen
            name="ScanQR"
            component={ScanQRScreen as any}
            options={{ title: 'Scan QR Code' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
