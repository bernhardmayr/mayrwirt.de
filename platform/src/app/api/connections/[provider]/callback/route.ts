import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeGoogleCode } from "@/lib/platforms/google";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login`);

  const { provider } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connections?error=oauth`);
  }

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connections?error=company`);

  if (provider === "google") {
    try {
      const tokens = await exchangeGoogleCode(code);
      await prisma.platformConnection.upsert({
        where: { companyId_provider_externalId: { companyId: company.id, provider: "google", externalId: "default" } },
        create: {
          companyId: company.id,
          provider: "google",
          externalId: "default",
          displayName: "Google Business Profile",
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
          status: "active",
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
          status: "active",
        },
      });
    } catch {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connections?error=token`);
    }
  }

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connections?connected=${provider}`);
}
