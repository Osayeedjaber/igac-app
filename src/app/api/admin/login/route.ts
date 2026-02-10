import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken } from "@/lib/admin-auth";

// Rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  // Rate limit check
  const attempts = loginAttempts.get(ip);
  if (attempts) {
    if (Date.now() - attempts.lastAttempt > WINDOW_MS) {
      loginAttempts.delete(ip);
    } else if (attempts.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        { status: 429 }
      );
    }
  }

  const { password } = await request.json();

  if (password === process.env.ADMIN_PASSWORD) {
    loginAttempts.delete(ip);
    const token = await generateAdminToken();
    return NextResponse.json({ success: true, token });
  }

  // Track failed attempt
  const current = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  loginAttempts.set(ip, { count: current.count + 1, lastAttempt: Date.now() });

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
