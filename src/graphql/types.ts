// Core types matching the remote GraphQL schema
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  accounts: AccountUser[];
  invitations: Invitation[];
}

export interface Account {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  properties: Property[];
  accountUsers: AccountUser[];
  invitations: Invitation[];
}

export interface AccountUser {
  id: string;
  account: Account;
  user: User;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  account: Account;
  name: string;
  address: string;
  description?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
  lists: List[];
}

export interface List {
  id: string;
  property: Property;
  name: string;
  description?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
  items: Item[];
}

export interface Item {
  id: string;
  list: List;
  name: string;
  description?: string;
  quantity: number;
  condition: ItemCondition;
  estimatedValue?: number;
  imageUrl?: string;
  barcode?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  account: Account;
  role: InvitationRole;
  invitedBy: User;
  token: string;
  expiresAt: string;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enums
export type UserRole = 'primary' | 'admin' | 'user';
export type InvitationRole = 'admin' | 'user';
export type ItemCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';

// Input types for mutations
export interface CreateAccountInput {
  name: string;
  description?: string;
}

export interface UpdateAccountInput {
  name?: string;
  description?: string;
}

export interface CreatePropertyInput {
  accountId: string;
  name: string;
  address: string;
  description?: string;
  barcode?: string;
}

export interface UpdatePropertyInput {
  name?: string;
  address?: string;
  description?: string;
  barcode?: string;
}

export interface CreateListInput {
  propertyId: string;
  name: string;
  description?: string;
  barcode?: string;
}

export interface UpdateListInput {
  name?: string;
  description?: string;
  barcode?: string;
}

export interface CreateItemInput {
  listId: string;
  name: string;
  description?: string;
  quantity?: number;
  condition?: ItemCondition;
  estimatedValue?: number;
  imageUrl?: string;
  barcode?: string;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  quantity?: number;
  condition?: ItemCondition;
  estimatedValue?: number;
  imageUrl?: string;
  barcode?: string;
  isCompleted?: boolean;
}

export interface InviteUserInput {
  accountId: string;
  email: string;
  role: InvitationRole;
}

export interface AcceptInvitationInput {
  token: string;
  userId: string;
}

export interface UpdateUserRoleInput {
  accountId: string;
  userId: string;
  role: UserRole;
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
