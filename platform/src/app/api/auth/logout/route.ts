import { NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/audit/audit-logger";

export async function POST() {
  await logAuditEvent({
    username: "admin",
    action: "AUTH_LOGOUT",
    target: "Sistema / Logout",
    status: "SUCCESS",
    details: "Cierre de sesión de usuario",
  });
  const response = NextResponse.json({ message: "Sesión finalizada exitosamente" });
  response.cookies.delete("control_plane_session");
  return response;
}
