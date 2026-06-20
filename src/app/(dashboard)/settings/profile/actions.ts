"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

interface ProfileUpdateData {
    userId: string;
    image?: string | null;
    currentPassword?: string;
    newPassword?: string;
}

export async function updateProfile(data: ProfileUpdateData) {
    try {
        const { userId, image, currentPassword, newPassword } = data;

        if (image && image.length > 2.8 * 1024 * 1024) {
            return { success: false, message: "Ukuran gambar maksimal 2.8MB" };
        }

        // 1. Ambil data user dari DB
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, message: "User tidak ditemukan" };

        const updatePayload: { password?: string; image?: string } = {};

        // 2. Logic Password (Hanya jika diisi)
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return { success: false, message: "Password lama salah!" };
            updatePayload.password = await bcrypt.hash(newPassword, 10);
        }

        // 3. Logic Foto
        if (image) {
            updatePayload.image = image;
        }

        // 4. Update Database
        await prisma.user.update({
            where: { id: userId },
            data: updatePayload,
        });

        revalidatePath("/"); // Revalidate homepage cache setelah update profil
        return { success: true, message: "Profil berhasil diperbarui!" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal update database" };
    }
}