import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  feedbackId: z.string().cuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.coerce.date().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json([], { status: 200 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const actions = await prisma.action.findMany({
    where: {
      companyId: company.id,
      ...(status ? { status } : {}),
    },
    include: { feedback: { select: { id: true, authorName: true, rating: true, source: true } } },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(actions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });

  const action = await prisma.action.create({
    data: {
      companyId: company.id,
      ...parsed.data,
    },
  });

  return NextResponse.json(action, { status: 201 });
}
