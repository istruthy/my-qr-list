// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User extends BaseEntity {
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Property types
export interface Property extends BaseEntity {
  name: string;
  address: string;
  rooms?: Room[];
}

export interface CreatePropertyInput {
  name: string;
  address: string;
}

export interface UpdatePropertyInput {
  name?: string;
  address?: string;
}

// Room types
export interface Room extends BaseEntity {
  name: string;
  description?: string;
  propertyId: string;
  items?: Item[];
}

export interface CreateRoomInput {
  name: string;
  description?: string;
  propertyId: string;
}

export interface UpdateRoomInput {
  name?: string;
  description?: string;
}

// Item types (for room items)
export interface Item extends BaseEntity {
  name: string;
  description?: string;
  status: ItemStatus;
  roomId: string;
}

export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

export interface CreateItemInput {
  name: string;
  description?: string;
  status: ItemStatus;
  roomId: string;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  status?: ItemStatus;
}

// List types
export interface List extends BaseEntity {
  title: string;
  barcode?: string;
  items: ListItem[];
}

export interface ListItem extends BaseEntity {
  text: string;
  completed: boolean;
  imageUrl?: string;
}

export interface CreateListInput {
  title: string;
  barcode?: string;
  items?: CreateListItemInput[];
}

export interface UpdateListInput {
  title?: string;
  barcode?: string;
}

export interface CreateListItemInput {
  text: string;
  imageUrl?: string;
}

export interface UpdateListItemInput {
  text?: string;
  completed?: boolean;
  imageUrl?: string;
}

// Search types
export interface BarcodeSearchResult {
  type: 'PROPERTY' | 'ROOM' | 'ITEM' | 'LIST';
  id: string;
  data: Property | Room | Item | List;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

// Mutation response types
export interface MutationResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}
