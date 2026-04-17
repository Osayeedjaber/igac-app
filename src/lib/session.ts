import { SignJWT, jwtVerify } from "jose";
const defaultSecret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "igac_super_secret_session_key_changeme"
);
export async function signSessionToken(payload: { role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(defaultSecret);
}
export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, defaultSecret);
    return payload;
  } catch (error) {
    return null;
  }
}
