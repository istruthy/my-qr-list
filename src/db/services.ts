import { db } from './index';
import { properties, lists, items, users } from './schema';
import { eq, and } from 'drizzle-orm';
import type { NewProperty, NewList, NewItem, NewUser } from './schema';

// User services
export const createUser = async (userData: NewUser) => {
  try {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const result = await db.select().from(users).where(eq(users.id, userId));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Property services
export const createProperty = async (propertyData: NewProperty) => {
  try {
    const result = await db.insert(properties).values(propertyData).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

export const getPropertiesByUserId = async (userId: string) => {
  try {
    const result = await db.select().from(properties).where(eq(properties.userId, userId));
    return result;
  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
};

export const getPropertyById = async (propertyId: string) => {
  try {
    const result = await db.select().from(properties).where(eq(properties.id, propertyId));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting property:', error);
    throw error;
  }
};

export const updateProperty = async (propertyId: string, updates: Partial<NewProperty>) => {
  try {
    const result = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(properties.id, propertyId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

export const deleteProperty = async (propertyId: string) => {
  try {
    await db.delete(properties).where(eq(properties.id, propertyId));
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// List/Room services
export const createList = async (listData: NewList) => {
  try {
    const result = await db.insert(lists).values(listData).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

export const getListsByPropertyId = async (propertyId: string) => {
  try {
    const result = await db.select().from(lists).where(eq(lists.propertyId, propertyId));
    return result;
  } catch (error) {
    console.error('Error getting lists:', error);
    throw error;
  }
};

export const getListById = async (listId: string) => {
  try {
    const result = await db.select().from(lists).where(eq(lists.id, listId));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting list:', error);
    throw error;
  }
};

export const updateList = async (listId: string, updates: Partial<NewList>) => {
  try {
    const result = await db
      .update(lists)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(lists.id, listId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

export const deleteList = async (listId: string) => {
  try {
    await db.delete(lists).where(eq(lists.id, listId));
    return true;
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

// Item services
export const createItem = async (itemData: NewItem) => {
  try {
    const result = await db.insert(items).values(itemData).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const getItemsByListId = async (listId: string) => {
  try {
    const result = await db.select().from(items).where(eq(items.listId, listId));
    return result;
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
};

export const getItemById = async (itemId: string) => {
  try {
    const result = await db.select().from(items).where(eq(items.id, itemId));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting item:', error);
    throw error;
  }
};

export const updateItem = async (itemId: string, updates: Partial<NewItem>) => {
  try {
    const result = await db
      .update(items)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(items.id, itemId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (itemId: string) => {
  try {
    await db.delete(items).where(eq(items.id, itemId));
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Utility functions
export const getListWithItems = async (listId: string) => {
  try {
    const list = await getListById(listId);
    if (!list) return null;

    const listItems = await getItemsByListId(listId);
    return {
      ...list,
      items: listItems,
    };
  } catch (error) {
    console.error('Error getting list with items:', error);
    throw error;
  }
};

export const getPropertyWithLists = async (propertyId: string) => {
  try {
    const property = await getPropertyById(propertyId);
    if (!property) return null;

    const propertyLists = await getListsByPropertyId(propertyId);
    return {
      ...property,
      lists: propertyLists,
    };
  } catch (error) {
    console.error('Error getting property with lists:', error);
    throw error;
  }
};

// Completion tracking services
export const getListCompletionStatus = async (listId: string) => {
  try {
    const list = await getListById(listId);
    if (!list) return null;

    const listItems = await getItemsByListId(listId);
    const totalItems = listItems.length;
    const completedItems = listItems.filter(item => item.isCompleted).length;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      ...list,
      itemCount: totalItems,
      completedItemCount: completedItems,
      completionPercentage,
    };
  } catch (error) {
    console.error('Error getting list completion status:', error);
    throw error;
  }
};

export const getPropertyCompletionStatus = async (propertyId: string) => {
  try {
    const property = await getPropertyById(propertyId);
    if (!property) return null;

    const propertyLists = await getListsByPropertyId(propertyId);
    const listsWithCompletion = await Promise.all(
      propertyLists.map(list => getListCompletionStatus(list.id))
    );

    const totalRooms = listsWithCompletion.length;
    const completedRooms = listsWithCompletion.filter(list => list?.isCompleted).length;
    const completionPercentage =
      totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0;

    return {
      ...property,
      lists: listsWithCompletion.filter(Boolean),
      totalRooms,
      completedRooms,
      completionPercentage,
    };
  } catch (error) {
    console.error('Error getting property completion status:', error);
    throw error;
  }
};

export const markListAsCompleted = async (listId: string) => {
  try {
    const result = await db
      .update(lists)
      .set({
        isCompleted: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lists.id, listId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error marking list as completed:', error);
    throw error;
  }
};

export const markListAsIncomplete = async (listId: string) => {
  try {
    const result = await db
      .update(lists)
      .set({
        isCompleted: false,
        completedAt: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lists.id, listId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error marking list as incomplete:', error);
    throw error;
  }
};

export const getPropertiesWithCompletion = async (userId: string) => {
  try {
    const userProperties = await getPropertiesByUserId(userId);
    const propertiesWithCompletion = await Promise.all(
      userProperties.map(property => getPropertyCompletionStatus(property.id))
    );
    return propertiesWithCompletion.filter(Boolean);
  } catch (error) {
    console.error('Error getting properties with completion:', error);
    throw error;
  }
};
