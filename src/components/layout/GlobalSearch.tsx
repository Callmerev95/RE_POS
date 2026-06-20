"use client";

import { Search, Package, Receipt, ArrowRight, Loader2, Plus, Command } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useCartStore } from "@/store/useCartStore";
import { usePathname, useRouter } from "next/navigation";
import type { ProductUI as Product } from "@/app/(dashboard)/products/types/product.types";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/useOrderStore";


// --- PROPS INTERFACE ---
interface SearchItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  rightIcon?: React.ReactNode;
  isSelected?: boolean;
}

interface OrderResult {
  id: string;
  customerName: string | null;
  total: number;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const openOrder = useOrderStore((s) => s.openOrder);

  const { products, orders, isLoading } = useGlobalSearch(query);
  const allResults = [...products, ...orders];

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (p: Product) => {
    if (pathname === "/pos") {
      addItem({ productId: p.id, name: p.name, price: p.price, categoryType: p.categoryType });
      setQuery("");
      setIsOpen(false);
      setSelectedIndex(0);
    } else {
      router.push("/products");
      setIsOpen(false);
    }
  };

  const handleSelectOrder = (o: OrderResult) => {
    setQuery("");
    setIsOpen(false);
    openOrder(o.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allResults.length > 0) {
        const item = allResults[selectedIndex];
        if (item) {
          // Tipe Guard untuk membedakan antara Product dan OrderResult
          if ("price" in item) {
            handleSelectProduct(item as Product);
          } else {
            handleSelectOrder(item as OrderResult);
          }
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-md group" ref={containerRef}>
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        {isLoading ? (
          <Loader2 size={18} className="animate-spin text-orange-500" />
        ) : (
          <Search size={18} className="text-slate-400 group-focus-within:text-slate-900 transition-colors" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setSelectedIndex(0); }}
        placeholder="Cari transaksi atau produk..."
        className="w-full h-12 bg-slate-50 border-2 border-transparent py-2.5 pl-12 pr-16 rounded-[1.25rem] text-sm font-bold outline-none focus:bg-white focus:border-slate-200 transition-all shadow-sm text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
      />

      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-black text-slate-400 shadow-sm">
          <Command size={10} /> K
        </kbd>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="max-h-100 overflow-y-auto p-3">

            {products.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-black text-slate-400 px-4 py-2 uppercase tracking-[0.2em]">Produk Tersedia</p>
                {products.map((p, index) => (
                  <div key={p.id} onClick={() => handleSelectProduct(p as Product)}>
                    <SearchItem
                      icon={<Package size={16} />}
                      title={p.name}
                      subtitle={`Rp ${p.price.toLocaleString()}`}
                      rightIcon={pathname === "/pos" ? <Plus size={14} /> : <ArrowRight size={14} />}
                      isSelected={index === selectedIndex}
                    />
                  </div>
                ))}
              </div>
            )}

            {orders.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 px-4 py-2 uppercase tracking-[0.2em]">Riwayat Transaksi</p>
                {orders.map((o, index) => {
                  const actualIndex = products.length + index;
                  return (
                    <div key={o.id} onClick={() => handleSelectOrder(o as OrderResult)}>
                      <SearchItem
                        icon={<Receipt size={16} />}
                        title={o.customerName || `Order #${o.id.slice(-4)}`}
                        subtitle={`Rp ${o.total.toLocaleString()} • #${o.id.slice(-4)}`}
                        isSelected={actualIndex === selectedIndex}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && allResults.length === 0 && (
              <div className="py-12 text-center">
                <div className="inline-flex p-4 bg-slate-50 rounded-full mb-3">
                  <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-400 italic">{`Tidak ditemukan hasil untuk "${query}"`}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchItem({ icon, title, subtitle, rightIcon, isSelected }: SearchItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all",

      isSelected ? "bg-orange-50 ring-1 ring-orange-100" : "hover:bg-slate-50"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
        isSelected ? "bg-white text-orange-600 shadow-sm" : "bg-white text-slate-400 border border-slate-100 shadow-sm"
      )}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className={cn(
          "text-sm font-black tracking-tight transition-colors",
          isSelected ? "text-orange-950" : "text-slate-700"
        )}>
          {title}
        </h4>
        <p className={cn(
          "text-[11px] font-bold transition-colors",
          isSelected ? "text-orange-600/80" : "text-slate-400"
        )}>{subtitle}</p>
      </div>
      <div className={cn(
        "transition-all mr-2",
        isSelected ? "opacity-100 text-orange-500 translate-x-0" : "opacity-0 text-slate-300"
      )}>
        {rightIcon || <ArrowRight size={14} />}
      </div>
    </div>
  );
}