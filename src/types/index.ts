import type { NavigatorScreenParams } from '@react-navigation/native';

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
  barcode: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PropertiesStackParamList = {
  PropertySelection: undefined;
  PropertyDetails: { propertyId: string };
  ListDetails: { listId: string; listName: string; propertyId: string };
  AddItem: { listId: string; propertyId: string };
};

export type MainTabParamList = {
  Properties: NavigatorScreenParams<PropertiesStackParamList> | undefined;
  Scan: undefined;
  Admin: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  CreateList: { scannedBarcode?: string } | undefined;
  ViewList: { listId: string };
  ScanQR:
    | {
        mode?: 'view' | 'create' | 'property' | 'room' | 'item';
        scannedBarcode?: string;
        propertyId?: string;
        roomId?: string;
        listId?: string;
        onPropertyScanned?: (propertyId: string) => void;
        onRoomScanned?: (roomId: string) => void;
        onItemScanned?: (barcode: string) => void;
        onScanCancelled?: () => void;
      }
    | undefined;
};
