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
  CreateList: { scannedBarcode?: string } | undefined;
  ViewList: { listId: string };
  ScanQR: { mode?: 'view' | 'create'; scannedBarcode?: string } | undefined;
};
