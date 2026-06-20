import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { name } = await req.json();
  const { id } = await params;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Nama kategori wajib diisi" },
      { status: 400 }
    );
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(category);
}


export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
