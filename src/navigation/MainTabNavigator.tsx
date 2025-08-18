import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { PropertiesStackNavigator } from './PropertiesStackNavigator';
import { ScanQRScreen } from '../screens/ScanQRScreen';
import { AdminScreen } from '../screens/AdminScreen';
import { MainTabParamList } from '../types';

// Wrapper component for ScanQRScreen to handle navigation props
const ScanTabScreen: React.FC = () => {
  return <ScanQRScreen navigation={{} as any} route={{}} />;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
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
