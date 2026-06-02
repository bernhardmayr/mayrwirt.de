import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildGoogleOAuthUrl } from "@/lib/platforms/google";
import { randomBytes } from "crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { provider } = await params;

  if (provider === "google") {
    const state = randomBytes(16).toString("hex");
    const url = buildGoogleOAuthUrl(state);
    return NextResponse.redirect(url);
  }

  if (provider === "booking") {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/connections?info=booking`
    );
  }

  if (provider === "tripadvisor") {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/connections?info=tripadvisor`
    );
  }

  return NextResponse.json({ error: "Unbekannter Anbieter." }, { status: 400 });
}
