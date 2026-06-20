"use server";

import { prisma as db } from "@/lib/prisma";
import { ExpenseCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Skema Validasi tetap sama
const ExpenseSchema = z.object({
  name: z.string().min(3, "Nama pengeluaran minimal 3 karakter"),
  amount: z.number().min(1, "Nominal harus lebih dari 0"),
  category: z.nativeEnum(ExpenseCategory),
  date: z.date(),
  note: z.string().optional().nullable(),
});

// Tipe input mentah sebelum validasi
interface RawExpenseInput {
  name: string;
  amount: string | number;
  category: ExpenseCategory;
  date: string | Date;
  note?: string | null;
}

export async function createExpense(rawDate: RawExpenseInput) {
  try {
    const validatedData = ExpenseSchema.parse({
      ...rawDate,
      date: new Date(rawDate.date),
      amount: Number(rawDate.amount),
    });

    const expense = await db.expense.create({
      data: validatedData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/inventory/expenses");
    
    return { success: true, data: expense };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Ambil pesan error pertama dari array issues secara eksplisit
      const firstIssue = error.issues[0];
      const errorMessage = firstIssue ? firstIssue.message : "Validasi gagal";
      
      return { success: false, error: errorMessage };
    }
    console.error("CREATE_EXPENSE_ERROR:", error);
    return { success: false, error: "Gagal mencatat biaya operasional" };
  }
}

export async function getExpenses(params?: {
  startDate?: Date;
  endDate?: Date;
  category?: ExpenseCategory;
}) {
  try {
    const expenses = await db.expense.findMany({
      where: {
        date: {
          gte: params?.startDate,
          lte: params?.endDate,
        },
        category: params?.category,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: expenses };
  } catch (error) {
    console.error("GET_EXPENSES_ERROR:", error);
    return { success: false, error: "Gagal memuat data biaya" };
  }
}

export async function deleteExpense(id: string) {
  try {
    await db.expense.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/inventory/expenses");

    return { success: true };
  } catch (error) {
    console.error("DELETE_EXPENSE_ERROR:", error);
    return { success: false, error: "Gagal menghapus data biaya" };
  }
}



export async function updateExpense(id: string, rawData: RawExpenseInput) {
  try {
    const validatedData = ExpenseSchema.parse({
      ...rawData,
      date: new Date(rawData.date),
      amount: Number(rawData.amount),
    });

    const expense = await db.expense.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/inventory/expenses");
    return { success: true, data: expense };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return { success: false, error: firstIssue ? firstIssue.message : "Validasi gagal" };
    }
    return { success: false, error: "Gagal memperbarui data" };
  }
}