import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REPO_ROOT = path.resolve(process.cwd(), "..");

interface RouteParams {
  params: Promise<{ id: string; filename: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: tenantId, filename } = await params;

    // Prevenir Directory Traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(REPO_ROOT, "platform", "backups", tenantId, safeFilename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Archivo de respaldo no encontrado" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Backup Download GET] Error:", error);
    return NextResponse.json({ error: "Error descargando archivo de respaldo" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: tenantId, filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(REPO_ROOT, "platform", "backups", tenantId, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ message: "Respaldo eliminado con éxito" });
  } catch (error) {
    console.error("[Backup DELETE] Error:", error);
    return NextResponse.json({ error: "Error eliminando archivo de respaldo" }, { status: 500 });
  }
}
