"use client";

import { useState, useMemo, useEffect } from "react";
import { Wallet, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { OrderFooter } from "@/app/(dashboard)/order/components/OrderFooter";
import { CreditNote } from "@/app/(dashboard)/order/components/CreditNote";
import { CreateExpenseDialog } from "./components/CreateExpenseDialog";
import { ExpenseActionButtons } from "./components/ExpenseActionButtons";
import { ExpenseUI } from "./types/expense.types";

interface Props {
    initialData: ExpenseUI[];
}

export default function ExpensesClient({ initialData }: Props) {
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");


    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const filteredExpenses = useMemo(() => {
        return initialData.filter(e =>
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [initialData, searchTerm]);

    const totalAmount = useMemo(() => {
        return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    }, [filteredExpenses]);

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
            <div className="shrink-0 flex flex-col gap-2">
                <PremiumHeader
                    icon={Wallet}
                    title="BIAYA OPERASIONAL"
                    subtitle="KELOLA DAN CATAT PENGELUARAN DILUAR BAHAN BAKU"
                    actions={<CreateExpenseDialog />}
                />

                <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 flex items-center justify-between px-6 h-14">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari biaya atau kategori..."
                                className="w-full pl-12 pr-6 py-2 bg-slate-100/50 border-none rounded-xl text-[11px] font-bold focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-8 pr-4">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Terfilter</p>
                            <p className="text-[13px] font-black text-red-600 tabular-nums mt-0.5">
                                Rp {totalAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc]">
                    <table className="w-full text-sm border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-8 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Tanggal</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Nama Pengeluaran</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Kategori</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Nominal</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] pr-10 py-5 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            <AnimatePresence mode="popLayout">
                                {filteredExpenses.map((expense) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={expense.id}
                                        className="group transition-all duration-500 relative bg-white hover:bg-slate-50/50"
                                    >
                                        <td className="px-8 py-6 relative">
                                            <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                                            <span className="text-[11px] font-black text-slate-400 uppercase tabular-nums">
                                                {format(new Date(expense.date), "dd MMM yyyy", { locale: localeId })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-black text-slate-700 uppercase group-hover:text-cyan-600 transition-colors mb-0.5">{expense.name}</p>
                                            {expense.note && <p className="text-[9px] text-slate-400 font-bold italic leading-none">{expense.note}</p>}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                {expense.category.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right font-black text-sm text-red-600 tabular-nums">
                                            <span className="text-[10px] text-slate-400 mr-1 font-bold">Rp</span>
                                            {expense.amount.toLocaleString()}
                                        </td>
                                        <td className="pr-10 py-6 text-right">
                                            <ExpenseActionButtons expense={expense} />
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                <OrderFooter count={filteredExpenses.length} label="Total Catatan Biaya" />
            </div>

            <CreditNote />
        </div>
    );
}