import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("control_plane_session")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      username: payload.username,
      fullName: payload.fullName,
      role: payload.role,
    },
  });
}
