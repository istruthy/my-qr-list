export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  imageUrl?: string;
}

export interface List {
  id: string;
  title: string;
  items: ListItem[];
  createdAt: string;
  updatedAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  CreateList: undefined;
  ViewList: { listId: string };
  ScanQR: undefined;
}; 