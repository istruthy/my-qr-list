import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
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
        options={({ navigation }) => ({
          title: 'innventry',
          headerStyle: {
            backgroundColor: '#1e3a8a', // Dark blue background
          },
          headerTintColor: '#ffffff', // White text and icons
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // Navigate to Admin tab by going back to main tabs and then to Admin
                navigation.dispatch(CommonActions.navigate('MainTabs', { screen: 'Admin' }));
              }}
              style={{
                padding: 8,
              }}
            >
              <Ionicons name="person-circle" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={({ navigation }) => ({
          headerStyle: {
            backgroundColor: '#1e3a8a', // Dark blue background
          },
          headerTintColor: '#ffffff', // White text and icons
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(CommonActions.navigate('MainTabs', { screen: 'Admin' }));
              }}
              style={{
                // marginRight: 8,
                padding: 8,
              }}
            >
              <Ionicons name="person-circle" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="ListDetails"
        component={ListDetailsScreen}
        options={({ route, navigation }) => ({
          title: route.params?.listName || 'List Details',
          headerStyle: {
            backgroundColor: '#1e3a8a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // headerRight: () => (
          //   <TouchableOpacity
          //     onPress={() => {
          //       navigation.dispatch(CommonActions.navigate('MainTabs', { screen: 'Admin' }));
          //     }}
          //     style={{
          //       marginRight: 16,
          //       padding: 8,
          //     }}
          //   >
          //     <Ionicons name="person-circle" size={24} color="#ffffff" />
          //   </TouchableOpacity>
          // ),
        })}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={({ navigation }) => ({
          title: 'Add Item',
          headerStyle: {
            backgroundColor: '#1e3a8a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // headerRight: () => (
          //   <TouchableOpacity
          //     onPress={() => {
          //       navigation.dispatch(CommonActions.navigate('MainTabs', { screen: 'Admin' }));
          //     }}
          //     style={{
          //       marginRight: 16,
          //       padding: 8,
          //     }}
          //   >
          //     <Ionicons name="person-circle" size={24} color="#ffffff" />
          //   </TouchableOpacity>
          // ),
        })}
      />
    </Stack.Navigator>
  );
};
