"use client";

import { useState, useMemo, useEffect } from "react";
import { Users, Search, ShieldCheck, UserCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { OrderFooter } from "@/app/(dashboard)/order/components/OrderFooter";
import { CreateUserDialog } from "./CreateUserDialog";
import { UserActions } from "./UserActions";
import { Role, User } from "@prisma/client";


interface UserClientProps {
  initialData: User[];
}

export default function UserClient({ initialData }: UserClientProps) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const filteredUsers = useMemo(() => {
    return initialData.filter(u =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [initialData, searchTerm]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
      <div className="shrink-0 flex flex-col gap-2">
        <PremiumHeader
          icon={Users}
          title="MANAJEMEN STAF"
          subtitle="KELOLA HAK AKSES DAN AKUN KARYAWAN CAFE"
          actions={<CreateUserDialog />}
        />

        <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau email staf..."
                className="w-full pl-12 pr-6 py-2 bg-slate-100/50 border-none rounded-xl text-[11px] font-bold focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-400 h-8 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc] pb-12">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky top-0 z-30 bg-[#f8fafc] px-8 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Staf</th>
                <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-center font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Role Akses</th>
                <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Bergabung</th>
                <th className="sticky top-0 z-30 bg-[#f8fafc] px-8 py-4 text-right font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={user.id}
                    className="group transition-all duration-500 relative bg-white hover:z-20 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]"
                  >
                    <td className="px-8 py-5 relative">
                      <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                      <div className="flex items-center gap-4">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                          <Image src={user.image || "https://github.com/shadcn.png"} alt="" fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700 uppercase group-hover:text-cyan-600 transition-colors tracking-tight">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold leading-none">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${user.role === Role.ADMIN ? "bg-amber-100 text-amber-600 group-hover:bg-slate-900 group-hover:text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white"
                        }`}>
                        {user.role === Role.ADMIN ? <ShieldCheck className="w-3 h-3 mr-1.5" /> : <UserCog className="w-3 h-3 mr-1.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-[11px] text-slate-400 tabular-nums uppercase">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <UserActions user={user} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <OrderFooter count={filteredUsers.length} label="Total Staf Terdaftar" />
      </div>
    </div>
  );
}