import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/passwords";
import { signSessionToken } from "@/lib/auth/jwt";
import { LoginSchema } from "@/lib/validators/tenant.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos de acceso inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Credenciales incorrectas o usuario deshabilitado" },
        { status: 401 }
      );
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Credenciales incorrectas o usuario deshabilitado" },
        { status: 401 }
      );
    }

    // Generar token JWT de sesión
    const token = await signSessionToken({
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Autenticación exitosa",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });

    // Determinar si la conexión es HTTPS
    const isHttps = request.headers.get("x-forwarded-proto") === "https";

    // Fijar cookie HttpOnly segura
    response.cookies.set({
      name: "control_plane_session",
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return response;
  } catch (error) {
    console.error("[Login API] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor durante el inicio de sesión" },
      { status: 500 }
    );
  }
}
