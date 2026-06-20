export interface PrinterSettings {
  name: string;
  paperSize: number;
  header: string;
  address: string;
  footer: string;
}

// Bluetooth API Types
export interface BluetoothNavigator extends Navigator {
  bluetooth: {
    requestDevice: (options: {
      acceptAllDevices?: boolean;
      optionalServices?: string[];
    }) => Promise<BluetoothDevice>;
  };
}

export interface BluetoothDevice {
  gatt?: {
    connect: () => Promise<BluetoothRemoteGATTServer>;
  };
}

export interface BluetoothRemoteGATTServer {
  getPrimaryService: (service: string) => Promise<BluetoothRemoteGATTService>;
}

export interface BluetoothRemoteGATTService {
  getCharacteristic: (characteristic: string) => Promise<BluetoothRemoteGATTCharacteristic>;
}

export interface BluetoothRemoteGATTCharacteristic {
  writeValue: (value: BufferSource) => Promise<void>;
}