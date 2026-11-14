import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Sesión finalizada exitosamente" });
  response.cookies.delete("control_plane_session");
  return response;
}
