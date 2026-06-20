# ☕ RE_POS - Sistem Penjualan Terpadu

Aplikasi Point of Sale (POS) modern yang dirancang khusus untuk bisnis kafe dan restoran. Dengan antarmuka intuitif dan fitur-fitur canggih, RE_POS memudahkan Anda mengelola penjualan, inventaris, dan laporan bisnis secara efisien.

## 🎯 Fitur Utama

- **Penjualan Cepat** - Interface POS yang responsif dan user-friendly untuk transaksi cepat
- **Manajemen Inventaris** - Tracking stok produk real-time dengan notifikasi stok minimal
- **Laporan & Analytics** - Dashboard komprehensif dengan laporan penjualan harian dan analisis mendalam
- **Manajemen Pengguna** - Sistem role-based access control dengan berbagai level permission
- **Multi-Kategori** - Organisasi produk yang fleksibel dengan kategori custom
- **PWA Support** - Akses offline dan pengalaman app-like di mobile devices
- **Manajemen Kitchen** - Order management untuk dapur dengan sistem notifikasi
- **Hold Order** - Fitur menahan pesanan untuk transaksi kompleks
- **Multi-User** - Dukungan untuk multiple cashier dan staff roles
- **Search Global** - Pencarian cepat untuk produk dan data lainnya
- **Export Data** - Export laporan ke format Excel untuk analisis lebih lanjut

## 🛠 Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org)** - React framework dengan SSR dan SSG
- **[React 19](https://react.dev)** - UI library modern
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com)** - Komponen UI berkualitas tinggi
- **[Zustand](https://github.com/pmndrs/zustand)** - State management yang sederhana
- **[Recharts](https://recharts.org)** - Library charts untuk visualisasi data
- **[Sonner](https://sonner.emilkowal.ski)** - Toast notifications yang cantik
- **[Motion](https://motion.dev)** - Animation library

### Backend & Database
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Backend API
- **[Prisma](https://www.prisma.io)** - ORM untuk database management
- **[PostgreSQL](https://www.postgresql.org)** - Database relasional
- **[Supabase](https://supabase.com)** - Backend-as-a-Service dengan PostgreSQL

### Authentication & Security
- **[Supabase Auth](https://supabase.com/docs/guides/auth)** - Autentikasi
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing

### Other Tools
- **[ESLint](https://eslint.org)** - Code linting
- **[PWA](https://github.com/shadowwalker/next-pwa)** - Progressive Web App support
- **[XLSX](https://github.com/SheetJS/sheetjs)** - Excel export functionality

## 📋 Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- **Node.js** >= 18.0.0
- **npm** atau **pnpm** untuk package management
- **Git** untuk version control
- **PostgreSQL** database (atau Supabase)
- **Supabase Account** untuk authentication dan backend

## 🚀 Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/Callmerev95/RE_POS.git
cd RE_POS
```

### 2. Install Dependencies
```bash
npm install
# atau
pnpm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/re_pos"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Struktur Project

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Main dashboard dengan fitur utama
│   │   ├── categories/      # Manajemen kategori
│   │   ├── inventory/       # Manajemen inventaris
│   │   ├── kitchen/         # Kitchen management
│   │   ├── order/           # Order management
│   │   ├── pos/             # Point of Sale
│   │   ├── products/        # Manajemen produk
│   │   ├── profile/         # User profile
│   │   ├── reports/         # Laporan dan analytics
│   │   ├── roles/           # Role management
│   │   ├── user/            # User management
│   │   └── settings/        # Pengaturan aplikasi
│   ├── actions/             # Server actions
│   └── api/                 # API routes
├── components/
│   ├── layout/              # Layout components
│   ├── shared/              # Shared components untuk fitur
│   └── ui/                  # Reusable UI components
├── context/                 # React context untuk state
├── features/                # Feature-specific logic
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
├── middleware.ts            # Next.js middleware
├── store/                   # Zustand stores untuk state management
└── types/                   # TypeScript type definitions

prisma/
├── schema.prisma            # Database schema
└── seed.ts                  # Database seeding script
```

## 🗄️ Database Schema

Project menggunakan Prisma sebagai ORM. Untuk melihat dan memodifikasi schema database, lihat file `prisma/schema.prisma`.

### Generate Prisma Client
```bash
npx prisma generate
```

### Buat Migration Baru
```bash
npx prisma migrate dev --name <migration-name>
```

### View Database dengan Prisma Studio
```bash
npx prisma studio
```

## 💾 State Management

Aplikasi menggunakan **Zustand** untuk state management dengan beberapa stores:

- `useCartStore` - Manajemen shopping cart
- `useOrderStore` - Manajemen order
- `useReceiptStore` - Manajemen receipt
- `useHoldOrderStore` - Manajemen hold order

## 🔐 Authentication & Authorization

Sistem autentikasi menggunakan Supabase Auth dengan role-based access control:

- **Admin** - Full access ke semua fitur
- **Manager** - Akses ke dashboard, reports, inventory management
- **Cashier** - Akses ke POS dan order management
- **Kitchen Staff** - Akses ke kitchen management

## 🚢 Deployment

### Deploy ke Vercel (Recommended)

1. Push code ke GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel dashboard
4. Deploy dengan sekali klik

```bash
# Build untuk production
npm run build

# Start production server
npm start
```

### Deploy ke Server Lain

```bash
# Build aplikasi
npm run build

# Start server
npm start
```

## 🛠️ Available Scripts

- `npm run dev` - Jalankan development server dengan Turbopack
- `npm run build` - Build aplikasi untuk production
- `npm start` - Start production server
- `npm run lint` - Jalankan ESLint untuk code quality

## 📱 PWA Features

Aplikasi ini adalah Progressive Web App yang mendukung:

- **Offline Support** - Bekerja offline dengan service worker
- **Installable** - Dapat diinstal di home screen mobile
- **Fast Load** - Caching strategy untuk performa optimal

## 📊 Analytics & Reports

Dashboard reports menyediakan:

- Penjualan harian, mingguan, dan bulanan
- Top products
- Revenue analysis
- Traffic analytics
- Export ke Excel untuk analisis lebih lanjut

## 🤝 Contributing

Kami menerima kontribusi! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Project ini dilisensikan di bawah [MIT License](LICENSE).

## 📞 Support & Contact

Untuk dukungan, questions, atau bug reports:

- Email: revanggabramaekaputra@gmail.com

---


