import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';
import { PropertiesStackNavigator } from './PropertiesStackNavigator';
import { ScanQRScreen } from '../screens/ScanQRScreen';
import { AdminScreen } from '../screens/AdminScreen';
import { CreateListScreen } from '../screens/CreateListScreen';
import { ViewListScreen } from '../screens/ViewListScreen';
import { GraphQLDebugScreen } from '../screens/GraphQLDebugScreen';
import { MainTabParamList, RootStackParamList } from '../types';
import { useNavigation, useRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper component for ScanQRScreen to handle navigation props
const ScanTabScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  return <ScanQRScreen navigation={navigation} route={route} />;
};

// Main tabs navigator
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          if (route.name === 'Properties') {
            iconName = 'home';
          } else if (route.name === 'Scan') {
            iconName = 'qrcode-scan';
          } else if (route.name === 'Admin') {
            iconName = 'cog';
          }

          return <IconButton icon={iconName} size={size} iconColor={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Properties"
        component={PropertiesStackNavigator}
        options={{ title: 'Properties' }}
      />
      <Tab.Screen name="Scan" component={ScanTabScreen} options={{ title: 'Scan QR' }} />
      <Tab.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin' }} />
    </Tab.Navigator>
  );
};

// Root stack navigator that includes main tabs and modal screens
export const MainTabNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
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
      <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ title: 'Scan QR Code' }} />
      <Stack.Screen
        name="GraphQLDebug"
        component={GraphQLDebugScreen}
        options={{ title: 'GraphQL Debug' }}
      />
    </Stack.Navigator>
  );
};
