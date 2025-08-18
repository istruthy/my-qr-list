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
  RoomDetails: { roomId: string; roomName: string; propertyId: string };
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
        onPropertyScanned?: (propertyId: string) => void;
        onRoomScanned?: (roomId: string) => void;
        onItemScanned?: (itemId: string) => void;
      }
    | undefined;
};
