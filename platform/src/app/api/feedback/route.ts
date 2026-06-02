import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parse } from "csv-parse/sync";
import { createHash } from "crypto";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const page = parseInt(searchParams.get("page") ?? "1");

  const feedbacks = await prisma.feedback.findMany({
    where: {
      companyId: company.id,
      ...(status ? { responseStatus: status } : {}),
      ...(source ? { source } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
    skip: (page - 1) * 50,
  });

  return NextResponse.json(feedbacks);
}

const CsvRowSchema = z.object({
  date: z.string().optional(),
  author: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  title: z.string().optional(),
  body: z.string().min(1),
  source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Multipart-Formular erwartet." }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Keine Datei." }, { status: 400 });

  const text = await file.text();

  let rows: Record<string, string>[];
  try {
    rows = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  } catch {
    return NextResponse.json({ error: "CSV konnte nicht gelesen werden." }, { status: 400 });
  }

  const normalized: {
    companyId: string;
    source: string;
    externalId: string;
    authorName: string | null;
    rating: number | null;
    title: string | null;
    body: string;
    publishedAt: Date;
  }[] = [];

  for (const row of rows) {
    const parsed = CsvRowSchema.safeParse({
      date: row.date ?? row.Datum ?? row.Date,
      author: row.author ?? row.Autor ?? row.Author,
      rating: row.rating ?? row.Bewertung ?? row.Rating,
      title: row.title ?? row.Titel ?? row.Title,
      body: row.body ?? row.text ?? row.Text ?? row.Body ?? row.Bewertungstext,
      source: row.source ?? row.Quelle ?? row.Source,
    });

    if (!parsed.success || !parsed.data.body) continue;

    const { date, author, rating, title, body, source } = parsed.data;
    const externalId = createHash("md5").update(`${date}${author}${body}`).digest("hex");

    normalized.push({
      companyId: company.id,
      source: source ?? "csv",
      externalId,
      authorName: author ?? null,
      rating: rating ?? null,
      title: title ?? null,
      body,
      publishedAt: date ? new Date(date) : new Date(),
    });
  }

  if (!normalized.length) {
    return NextResponse.json({ error: "Keine gültigen Zeilen gefunden." }, { status: 400 });
  }

  // Deduplicate: skip already-imported records
  const existingIds = await prisma.feedback.findMany({
    where: {
      companyId: company.id,
      externalId: { in: normalized.map((n) => n.externalId) },
    },
    select: { externalId: true },
  });
  const existingSet = new Set(existingIds.map((e) => e.externalId));
  const toInsert = normalized.filter((n) => !existingSet.has(n.externalId));

  let importedCount = 0;
  if (toInsert.length > 0) {
    const result = await prisma.feedback.createMany({ data: toInsert });
    importedCount = result.count;
  }

  return NextResponse.json({ imported: importedCount });
}
