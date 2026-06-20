"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Coffee, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

// Login Page with Role-Based Redirect
export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Mohon isi email dan password");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login gagal");
        return;
      }

      toast.success("Login berhasil! Selamat datang");

      // ROLE REDIRECT 
      if (data.role === "ADMIN") {
        router.replace("/dashboard");
      } else {
        router.replace("/pos");
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* LEFT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/90 via-primary/70 to-primary/50 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY2NjU2Mzk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Coffee Shop"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Coffee className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl">RE_POS</h1>
                <p className="text-white/80">Point of Sale System</p>
              </div>
            </div>

            <h2 className="text-3xl mb-4">
              Kelola Bisnis Anda dengan Mudah
            </h2>
            <p className="text-lg text-white/90 max-w-md">
              Sistem kasir modern yang dirancang khusus untuk coffee shop.
              Cepat, mudah, dan efisien. 
            </p>

            <div className="mt-12 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  ✓
                </div>
                <span className="text-white/90">Manajemen produk yang efektif</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  ✓
                </div>
                <span className="text-white/90">Proses transaksi yang cepat</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  ✓
                </div>
                <span className="text-white/90">Laporan penjualan real-time</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl">
              <Coffee className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl">Padhe Coffee</h1>
            </div>
          </div>

          <Card className="p-8 border-border/50 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl mb-2">Selamat Datang Kembali</h2>
              <p className="text-muted-foreground">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email atau Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="admin@coffeeshop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-muted-foreground">Ingat saya</span>
                </label>
                <a
                  href="#"
                  className="text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Hubungi administrator untuk reset password");
                  }}
                >
                  Lupa password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Coffee className="h-5 w-5" />
                  </motion.div>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © 2026 RE_POS. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
