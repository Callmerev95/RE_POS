"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useHoldOrderStore } from "@/store/useHoldOrderStore";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function HoldOrders() {
    const router = useRouter();
    const holds = useHoldOrderStore((s) => s.holds);
    const resumeHold = useHoldOrderStore((s) => s.resumeHold);
    const loadHoldToCart = useCartStore((s) => s.loadHoldToCart);

    const handleRecall = (id: string) => {
        const order = resumeHold(id);
        if (order) {
            loadHoldToCart(order);
            router.push("/pos");
        }
    };

    return (
        <div className="relative group">
            {/* BUTTON: Area trigger hover */}
            <button className="relative p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                <Bell
                    size={20}
                    className={cn(
                        "transition-all duration-300",
                        holds.length > 0 ? "text-orange-500 fill-orange-50/50 animate-pulse" : "text-slate-400"
                    )}
                />

                {/* DOT NOTIFIKASI */}
                {holds.length > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-slate-50"></span>
                    </span>
                )}
            </button>

          
            {holds.length > 0 && (
                <div className="absolute top-full right-0 w-80 z-50 
                    pt-3 
                    hidden group-hover:block 
                    animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    
                    <div className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-4xl overflow-hidden">
                        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <p className="font-black text-xs uppercase tracking-widest opacity-60">Pending</p>
                                <p className="font-black text-lg leading-tight">Antrean Pesanan</p>
                            </div>
                            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-sm">
                                {holds.length}
                            </div>
                        </div>

                        <div className="max-h-100 overflow-y-auto p-2">
                            {holds.map((hold) => (
                                <button
                                    key={hold.id}
                                    onClick={() => handleRecall(hold.id)}
                                    className="w-full text-left p-4 mb-2 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group/item"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-black text-sm text-slate-900 truncate max-w-40 leading-tight capitalize">
                                                {hold.customerName || "Customer"}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                                ID: {hold.id.slice(-6)}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-black h-5 px-2 py-0 border-slate-200 rounded-lg uppercase tracking-widest text-slate-500">
                                            {hold.orderType}
                                        </Badge>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover/item:bg-white transition-colors">
                                        <p className="text-[10px] text-slate-600 font-bold line-clamp-2 italic leading-relaxed">
                                            {hold.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Klik untuk memproses pesanan</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}