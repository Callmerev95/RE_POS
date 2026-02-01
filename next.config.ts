import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true, // Kunci utama agar navigasi antar halaman di-cache
  aggressiveFrontEndNavCaching: true, // Memaksa cache lebih agresif
  reloadOnOnline: true, // Auto reload jika internet kembali nyala
  disable: process.env.NODE_ENV === "development", // Bagus ditukar ke ini                 
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rtabajdhhwynskkpyzxv.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
