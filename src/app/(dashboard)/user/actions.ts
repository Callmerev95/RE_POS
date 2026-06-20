"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";

// Skema Validasi Staf
const userSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.nativeEnum(Role),
  password: z.string().optional().or(z.literal("")),
});

// Mendefinisikan tipe 'UserInput' berdasarkan skema validasi
type UserInput = z.infer<typeof userSchema>;

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });
    return { success: true, data: users };
  } catch {
    // Menghapus 'error' variabel yang tidak digunakan
    return { success: false, error: "Gagal mengambil daftar staf" };
  }
}


export async function createUser(rawDetails: UserInput) {
  try {
    const validated = userSchema.parse(rawDetails);

    if (!validated.password || validated.password.length < 6) {
      return {
        success: false,
        error: "Password minimal 6 karakter untuk user baru",
      };
    }

    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (existing) return { success: false, error: "Email sudah digunakan" };

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: validated.role,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(validated.name)}&background=0f172a&color=fff`,
      },
    });

    revalidatePath("/user");
    return { success: true };
  } catch (error) {
  
    if (error instanceof z.ZodError)
      return { success: false, error: error.issues[0].message };
    return { success: false, error: "Gagal membuat user" };
  }
}


export async function updateUser(id: string, rawDetails: UserInput) {
  try {
    const validated = userSchema.parse(rawDetails);

    const updateData: {
      name: string;
      email: string;
      role: Role;
      image: string;
      password?: string;
    } = {
      name: validated.name,
      email: validated.email,
      role: validated.role,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(validated.name)}&background=0f172a&color=fff`,
    };

    if (validated.password && validated.password.trim() !== "") {
      if (validated.password.length < 6)
        return { success: false, error: "Password baru minimal 6 karakter" };
      updateData.password = await bcrypt.hash(validated.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/user");
    return { success: true };
  } catch (error) {

    if (error instanceof z.ZodError)
      return { success: false, error: error.issues[0].message };
    return { success: false, error: "Gagal memperbarui data" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/user");
    return { success: true };
  } catch {

    return { success: false, error: "Gagal menghapus staf" };
  }
}
