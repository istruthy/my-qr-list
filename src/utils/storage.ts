import AsyncStorage from '@react-native-async-storage/async-storage';
import { List } from '../types';

const LISTS_KEY = '@my_qr_list_lists';

export const getAllLists = async (): Promise<List[]> => {
  try {
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    return listsJson ? JSON.parse(listsJson) : [];
  } catch (error) {
    console.error('Error getting lists:', error);
    return [];
  }
};

export const getListById = async (id: string): Promise<List | null> => {
  try {
    const lists = await getAllLists();
    return lists.find(list => list.id === id) || null;
  } catch (error) {
    console.error('Error getting list by id:', error);
    return null;
  }
};

export const saveList = async (list: List): Promise<void> => {
  try {
    const lists = await getAllLists();
    const existingIndex = lists.findIndex(l => l.id === list.id);
    
    if (existingIndex >= 0) {
      lists[existingIndex] = list;
    } else {
      lists.push(list);
    }
    
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Error saving list:', error);
  }
};

export const deleteList = async (id: string): Promise<void> => {
  try {
    const lists = await getAllLists();
    const filteredLists = lists.filter(list => list.id !== id);
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(filteredLists));
  } catch (error) {
    console.error('Error deleting list:', error);
  }
};

export const updateList = async (updatedList: List): Promise<void> => {
  try {
    const lists = await getAllLists();
    const updatedLists = lists.map(list => 
      list.id === updatedList.id ? updatedList : list
    );
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
}; 