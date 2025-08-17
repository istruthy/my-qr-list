export type RootStackParamList = {
  Home: undefined;
  CreateList: {
    scannedBarcode?: string;
  };
  ViewList: { listId: string };
  ScanQR: {
    mode: 'view' | 'create';
    onCodeScanned?: (code: string) => void;
  };
};

export type List = {
  id: string;
  title: string;
  items: ListItem[];
  barcode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListItem = {
  id: string;
  text: string;
  completed: boolean;
  imageUrl?: string;
  createdAt: string;
};
