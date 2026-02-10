import { NextRequest, NextResponse } from "next/server";

const SALT = "igac-admin-token-v1";

async function hashToken(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input + SALT);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate a deterministic token from the admin password
export async function generateAdminToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "";
  return hashToken(password);
}

// Verify the token matches the expected hash of the password
export async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  const expected = await generateAdminToken();
  return token === expected;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
