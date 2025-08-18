import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PropertySelectionScreen } from '../screens/PropertySelectionScreen';
import { PropertyDetailsScreen } from '../screens/PropertyDetailsScreen';
import { RoomDetailsScreen } from '../screens/RoomDetailsScreen';
import { PropertiesStackParamList } from '../types';

const Stack = createNativeStackNavigator<PropertiesStackParamList>();

export const PropertiesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PropertySelection"
        component={PropertySelectionScreen}
        options={{
          title: 'My Properties',
          headerStyle: {
            backgroundColor: '#1e3a8a', // Dark blue background
          },
          headerTintColor: '#ffffff', // White text and icons
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{
          title: 'Property Details',
          headerStyle: {
            backgroundColor: '#1e3a8a', // Dark blue background
          },
          headerTintColor: '#ffffff', // White text and icons
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="RoomDetails"
        component={RoomDetailsScreen}
        options={({ route }) => ({
          title: route.params?.roomName || 'Room Details',
          headerStyle: {
            backgroundColor: '#1e3a8a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      />
    </Stack.Navigator>
  );
};
