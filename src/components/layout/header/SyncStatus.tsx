"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Wifi, WifiOff, CloudSync } from "lucide-react";
import { getAllOrders, updateOrderSyncStatus } from "@/lib/db";
import { syncOrderToCloud } from "@/app/(dashboard)/order/actions";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function SyncStatus() {
    const [isOnline, setIsOnline] = useState<boolean>(() => {
        if (typeof window !== "undefined") return window.navigator.onLine;
        return true;
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const syncInterval = useRef<NodeJS.Timeout | null>(null);

    const checkSyncStatus = useCallback(async () => {
        if (isSyncing) return;

        try {
            const orders = await getAllOrders();
            const unsynced = orders.filter((o) => !o.isSynced);

            if (typeof window !== "undefined" && window.navigator.onLine && unsynced.length > 0) {
                setIsSyncing(true);
                for (const order of unsynced) {
                    try {
                        const res = await syncOrderToCloud(order);
                        if (res.success) {
                            await updateOrderSyncStatus(order.id, true);
                        }
                    } catch (singleErr) {
                        console.error(`Gagal sync order ${order.id}:`, singleErr);
                    }
                }
            }
        } catch (err) {
            console.error("SYNC_STATUS_ERROR:", err);
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            checkSyncStatus();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        const initSync = async () => {
            await checkSyncStatus();
        };
        initSync();

        syncInterval.current = setInterval(checkSyncStatus, 30000);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            if (syncInterval.current) clearInterval(syncInterval.current);
        };
    }, [checkSyncStatus]);

    return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-white border border-slate-100 shadow-sm select-none">
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative flex items-center justify-center cursor-help">
                            {isOnline ? (
                                <>
                                
                                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                    <Wifi className="w-4 h-4 text-emerald-500 relative z-10" />
                                </>
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest border-none">
                        {isOnline ? "System Connected" : "System Offline"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>


            {isSyncing && (
                <div className="flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="w-px h-3 bg-slate-100" />
                    <CloudSync className="w-4 h-4 text-cyan-500 animate-spin" />
                </div>
            )}
        </div>
    );
}