

export interface PrintItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptData {
  header: string;
  address: string;
  paymentMethod: string; 
  items: PrintItem[];
  total: number;
  footer: string;
  kasir: string;
  customerName?: string;
  orderType?: string;
  subtotal: number;
  tax?: number;
  charge?: number;
  paid?: number;
  change?: number;
}

interface BluetoothNavigator extends Navigator {
  bluetooth: {
    requestDevice: (options: {
      acceptAllDevices?: boolean;
      optionalServices?: string[];
      filters?: Array<{ services: string[] }>;
    }) => Promise<{
      gatt?: {
        connect: () => Promise<{
          getPrimaryService: (service: string) => Promise<{
            getCharacteristic: (characteristic: string) => Promise<{
              writeValue: (value: BufferSource) => Promise<void>;
            }>;
          }>;
        }>;
      };
    }>;
  };
}

export async function printReceiptBluetooth(data: ReceiptData) {
  try {
    const nav = navigator as unknown as BluetoothNavigator;
    if (!nav.bluetooth) throw new Error("Browser tidak mendukung Bluetooth");

    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
    });

    if (!device.gatt) throw new Error("GATT tidak tersedia");
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(
      "000018f0-0000-1000-8000-00805f9b34fb",
    );
    const characteristic = await service.getCharacteristic(
      "00002af1-0000-1000-8000-00805f9b34fb",
    );

    const encoder = new TextEncoder();


    const formatRow = (
      label: string,
      value: string | number,
      isBold: boolean = false,
    ) => {
      const valStr =
        typeof value === "number" ? value.toLocaleString("id-ID") : value;

      const maxLabelLen = 32 - valStr.length - 1;
      const truncatedLabel =
        label.length > maxLabelLen ? label.substring(0, maxLabelLen) : label;

      const spaces = 32 - truncatedLabel.length - valStr.length;
      const row = `${truncatedLabel}${" ".repeat(spaces > 0 ? spaces : 1)}${valStr}\n`;

      return isBold ? `\x1b\x45\x01${row}\x1b\x45\x00` : row;
    };

    // --- 1. HEADER (Center, Bold, Besar) ---
    let content = `\x1b\x61\x01`;
    content += `\x1b\x45\x01\x1b\x21\x10${data.header.toUpperCase()}\x1b\x21\x00\x1b\x45\x00\n`;
    content += `\x1b\x21\x01${data.address}\x1b\x21\x00\n`;
    content += `--------------------------------\n\x1b\x61\x00`;

    // --- 2. INFO TRANSAKSI ---
    content += formatRow("Tgl", new Date().toLocaleDateString("id-ID"));
    content += formatRow("Kasir", data.kasir);
    if (data.customerName)
      content += formatRow("Cust", data.customerName, true);
    content += formatRow("Tipe", data.orderType || "Dine In");
    content += `--------------------------------\n`;

    // --- 3. ITEMS ---
    data.items.forEach((item: PrintItem) => {
      content += `\x1b\x45\x01${item.name.toUpperCase()}\x1b\x45\x00\n`;
      const itemRow = `${item.qty} x ${item.price.toLocaleString("id-ID")}`;
      const lineTotal = (item.qty * item.price).toLocaleString("id-ID");
      const spaces = 32 - itemRow.length - lineTotal.length;
      content += `${itemRow}${" ".repeat(spaces > 0 ? spaces : 1)}${lineTotal}\n`;
    });

    content += `--------------------------------\n`;

    // --- 4. RINCIAN BIAYA ---
    content += formatRow("Subtotal", data.subtotal);
    if (data.tax) content += formatRow("Tax", data.tax);
    if (data.charge) content += formatRow("Service", data.charge);
    content += `--------------------------------\n`;

    // --- 5. GRAND TOTAL ---
    const totalVal = `Rp ${data.total.toLocaleString("id-ID")}`;
    const totalSpaces = 32 - 6 - totalVal.length;
    content += `\x1b\x45\x01\x1b\x21\x20TOTAL ${" ".repeat(totalSpaces > 0 ? totalSpaces : 1)}${totalVal}\x1b\x21\x00\x1b\x45\x00\n`;

    // --- 6. PEMBAYARAN & METODE (NEW) ---
    content += formatRow("Metode", data.paymentMethod.toUpperCase()); // ✅ Muncul di struk

    if (data.paid) {
      content += formatRow("Bayar", data.paid);
      // Jika kembalian ada, cetak Bold
      if ((data.change ?? 0) > 0) {
        content += formatRow("Kembali", data.change || 0, true);
      } else {
        content += formatRow("Status", "LUNAS", true);
      }
    }

    content += `--------------------------------\n`;

    // --- 7. FOOTER ---
    content += `\x1b\x61\x01\n\x1b\x45\x01${data.footer}\x1b\x45\x00\n\n\n\n\n\x1b\x61\x00`;

    // CHUNKING DATA (Agar Bluetooth tidak overload)
    const fullBuffer = encoder.encode(content);
    const CHUNK_SIZE = 512;

    for (let i = 0; i < fullBuffer.length; i += CHUNK_SIZE) {
      const chunk = fullBuffer.slice(i, i + CHUNK_SIZE);
      await characteristic.writeValue(chunk);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("PRINT_ERROR:", error.message);
    return { success: false, error: error.message };
  }
}
