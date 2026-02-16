import { MagicLinkService } from "@/lib/system/magic-link-service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

/**
 * 🪄 MAGIC LINK HANDLER (VOICES 2026)
 * 
 * Route: /api/auth/magic-link?token=...
 * 
 * Logt de gebruiker in via de token en zet een sessie cookie.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return redirect("/login?error=no_token");
  }

  const userId = await MagicLinkService.validateToken(token);

  if (!userId) {
    return redirect("/login?error=invalid_token");
  }

  // Sherlock: Token is geldig. In een echte productie-omgeving zouden we hier 
  // een JWT of sessie-id genereren via Supabase Auth of een eigen systeem.
  // Voor nu simuleren we de login door de userId in een cookie te zetten.
  
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  
  // Zet een tijdelijke sessie cookie (Voices 2026 Standard)
  cookies().set("voices_session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  // Optioneel: Token verbruiken na gebruik
  // await MagicLinkService.consumeToken(token);

  return response;
}
