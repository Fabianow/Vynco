
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function getAdmin() {
  const session = await getServerSession();

  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (
    !user ||
    !["ADMIN", "SUPER_ADMIN"].includes(user.role)
  ) {
    return null;
  }

  return user;
}
