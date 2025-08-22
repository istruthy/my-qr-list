import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PropertySelectionScreen } from '../screens/PropertySelectionScreen';
import { PropertyDetailsScreen } from '../screens/PropertyDetailsScreen';
import { ListDetailsScreen } from '../screens/ListDetailsScreen';
import { AddItemScreen } from '../screens/AddItemScreen';
import { PropertiesStackParamList } from '../types';

const Stack = createNativeStackNavigator<PropertiesStackParamList>();

export const PropertiesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PropertySelection"
        component={PropertySelectionScreen}
        options={{
          title: 'Host Inventory Sync',
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
        name="ListDetails"
        component={ListDetailsScreen}
        options={({ route }) => ({
          title: route.params?.listName || 'List Details',
          headerStyle: {
            backgroundColor: '#1e3a8a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{
          title: 'Add Item',
          headerStyle: {
            backgroundColor: '#1e3a8a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};
