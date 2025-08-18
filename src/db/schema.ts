import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Properties table
export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  address: text('address'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Lists (rooms) table
export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  propertyId: text('property_id')
    .notNull()
    .references(() => properties.id),
  name: text('name').notNull(),
  description: text('description'),
  barcode: text('barcode'),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at').default(null),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Items table
export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  listId: text('list_id')
    .notNull()
    .references(() => lists.id),
  name: text('name').notNull(),
  description: text('description'),
  quantity: integer('quantity').default(1),
  condition: text('condition'), // new, good, fair, poor, damaged
  estimatedValue: real('estimated_value'),
  imageUrl: text('image_url'),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

// Extended types for completion tracking
export interface ListWithCompletion extends List {
  itemCount: number;
  completedItemCount: number;
  completionPercentage: number;
}

export interface PropertyWithCompletion extends Property {
  lists: ListWithCompletion[];
  totalRooms: number;
  completedRooms: number;
  completionPercentage: number;
}
