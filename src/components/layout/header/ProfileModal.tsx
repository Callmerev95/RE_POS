"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { updateProfile } from "@/app/(dashboard)/settings/profile/actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface ProfileModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ isOpen, onOpenChange }: ProfileModalProps) {
    const { user, updateUserLocal } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const defaultAvatar = "https://github.com/shadcn.png";

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran file max 2MB
            if (file.size > 2 * 1024 * 1024) {
                return toast.error("Ukuran foto maksimal 2MB");
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (!user?.id) return;

        // Validasi Password Baru
        if (passwords.new || passwords.confirm) {
            if (passwords.new !== passwords.confirm) {
                return toast.error("Konfirmasi password baru tidak cocok!");
            }
            if (passwords.new.length < 6) {
                return toast.error("Password baru minimal 6 karakter!");
            }
            if (!passwords.current) {
                return toast.error("Masukkan password saat ini untuk verifikasi!");
            }
        }

        setIsSubmitting(true);
        try {
            const result = await updateProfile({
                userId: user.id,
                image: previewImage || undefined,
                currentPassword: passwords.current || undefined,
                newPassword: passwords.new || undefined
            });

            if (result.success) {
                updateUserLocal({
                    image: previewImage || user.image
                });

                toast.success(result.message);
                onOpenChange(false);
                setPasswords({ current: "", new: "", confirm: "" });
                setPreviewImage(null);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-800">Profil & Keamanan</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Kelola akun Anda dan perbarui foto atau kata sandi.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center gap-4 py-6 bg-slate-50/50 rounded-2xl my-2">
                    <div 
                        className="relative group cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-xl bg-slate-200 transition-transform group-hover:scale-105">
                            <Image 
                                src={previewImage || user?.image || defaultAvatar} 
                                alt="Avatar" 
                                fill 
                                className="object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>

                    <div className="text-center">
                        <h3 className="font-bold text-slate-800 uppercase tracking-tight">{user?.name}</h3>
                        <p className="text-[10px] text-slate-400 font-medium italic">{user?.email}</p>
                        <Badge className="mt-2 bg-emerald-500 text-white border-none text-[9px] px-2 py-0">
                            {user?.role} ACCESS
                        </Badge>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Update Keamanan</label>
                        <div className="space-y-2">
                            <Input 
                                type="password" 
                                placeholder="Password Saat Ini" 
                                className="h-11 rounded-xl bg-slate-50 border-slate-100 text-xs focus-visible:ring-slate-200"
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                            />
                            <Input 
                                type="password" 
                                placeholder="Password Baru" 
                                className="h-11 rounded-xl bg-slate-50 border-slate-100 text-xs focus-visible:ring-slate-200"
                                value={passwords.new}
                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            />
                            <Input 
                                type="password" 
                                placeholder="Konfirmasi Password Baru" 
                                className="h-11 rounded-xl bg-slate-50 border-slate-100 text-xs focus-visible:ring-slate-200"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            />
                        </div>
                    </div>
                    <Button 
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-slate-900 font-bold text-xs h-11 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 mt-2"
                    >
                        {isSubmitting ? "Sedang Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}