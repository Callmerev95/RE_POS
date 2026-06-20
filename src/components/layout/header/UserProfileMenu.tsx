"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User as UserIcon, CreditCard, Printer, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ProfileModal } from "./ProfileModal";
import { cn } from "@/lib/utils";

export function UserProfileMenu() {
    const { user } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const defaultAvatar = "https://github.com/shadcn.png";

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* TRIGGER BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group"
            >
                <div className="text-right leading-none hidden sm:block">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{user?.name || "Revangga"}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.15em]">{user?.role || "ADMIN"}</p>
                </div>

                <div className="relative group">
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 p-0.5 transition-transform">
                        <div className="h-full w-full rounded-[0.9rem] bg-white overflow-hidden border-2 border-white relative">
                            <Image
                                src={user?.image || defaultAvatar}
                                alt="Avatar"
                                fill
                                className="object-cover"
                                sizes="44px"
                            />
                        </div>
                    </div>
                    <div className={cn(
                        "absolute -bottom-1 -right-1 bg-white rounded-lg shadow-sm border border-slate-100 p-0.5 transition-transform duration-300",
                        isOpen ? "rotate-180" : "rotate-0"
                    )}>
                        <ChevronDown size={12} className="text-slate-900" />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-56 p-1.5 bg-white border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.08)] rounded-3xl z-50 animate-in fade-in slide-in-from-top-2">
                
                    <div className="px-3 py-3 border-b border-slate-50 mb-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Status Online</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email || "admin@padhe.com"}</p>
                    </div>

                    <div className="space-y-0.5">
                        <button
                            onClick={() => { setIsOpen(false); setIsModalOpen(true); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10.5px] font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <div className="p-1 bg-slate-100 rounded-lg text-slate-500">
                                <UserIcon size={14} />
                            </div>
                            Profil Saya
                        </button>

                        <div className="pt-1.5">
                            <p className="px-3 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">Sistem</p>
                            <Link href="/settings/payment" className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10.5px] font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                                <div className="p-1 bg-slate-100 rounded-lg text-slate-500">
                                    <CreditCard size={14} />
                                </div>
                                Payment Method
                            </Link>
                            <Link href="/settings/printer" className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10.5px] font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                                <div className="p-1 bg-slate-100 rounded-lg text-slate-500">
                                    <Printer size={14} />
                                </div>
                                Konfigurasi Printer
                            </Link>
                        </div>
                    </div>

                    {/* Logout Button  */}
                    <button
                        onClick={handleLogout}
                        className="w-full mt-2 pt-2 border-t border-slate-50 flex items-center gap-2.5 px-3 py-2.5 text-[10.5px] text-rose-500 font-black hover:bg-rose-50 rounded-xl transition-all group"
                    >
                        <div className="p-1 bg-rose-100/50 rounded-lg text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <LogOut size={14} />
                        </div>
                        Keluar Aplikasi
                    </button>
                </div>
            )}
            <ProfileModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        </div>
    );
}