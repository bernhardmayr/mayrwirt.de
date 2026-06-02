import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PatchSchema = z.object({
  responseDraft: z.string().optional(),
  responseStatus: z.enum(["pending", "draft", "published", "skipped"]).optional(),
  responseText: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const feedback = await prisma.feedback.findFirst({
    where: { id, companyId: company.id },
    include: { actions: true },
  });

  if (!feedback) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json(feedback);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });

  const feedback = await prisma.feedback.findFirst({ where: { id, companyId: company.id } });
  if (!feedback) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const updated = await prisma.feedback.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const feedback = await prisma.feedback.findFirst({ where: { id, companyId: company.id } });
  if (!feedback) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  await prisma.feedback.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
