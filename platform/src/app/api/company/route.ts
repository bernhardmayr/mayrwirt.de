import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  return NextResponse.json(company);
}

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  language: z.string().length(2).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
