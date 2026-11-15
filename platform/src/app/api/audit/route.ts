import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const status = searchParams.get("status") || "";
    const format = searchParams.get("format") || "json";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = {};

    if (action && action !== "ALL") {
      where.action = action;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { target: { contains: search } },
        { details: { contains: search } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: format === "csv" ? 1000 : limit,
        skip: format === "csv" ? 0 : offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Exportación a CSV
    if (format === "csv") {
      const csvHeader = "ID,Fecha,Usuario,Rol,Accion,Recurso,Estado,Detalles,IP\n";
      const csvRows = logs.map((l) => {
        const dateStr = new Date(l.createdAt).toISOString();
        const detailsEscaped = `"${(l.details || "").replace(/"/g, '""')}"`;
        return `${l.id},${dateStr},${l.username},${l.userRole},${l.action},${l.target},${l.status},${detailsEscaped},${l.ipAddress || ""}`;
      });

      const csvContent = csvHeader + csvRows.join("\n");
      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="auditoria-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[Audit API GET] Error:", error);
    return NextResponse.json({ error: "Error obteniendo logs de auditoría" }, { status: 500 });
  }
}
