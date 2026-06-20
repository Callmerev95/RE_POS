import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionCookie.value },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt && session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}
