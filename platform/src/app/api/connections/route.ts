import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json([], { status: 200 });

  const connections = await prisma.platformConnection.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(connections);
}
