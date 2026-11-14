import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sseBroadcaster } from "@/lib/orchestrator/sse-broadcaster";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: tenantId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Mensaje de conexión inicial
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ tenantId })}\n\n`)
      );

      // 2. Enviar logs históricos del trabajo más reciente si existen
      try {
        const latestJob = await prisma.deploymentJob.findFirst({
          where: { tenantId },
          orderBy: { startedAt: "desc" },
          include: {
            logs: {
              orderBy: { timestamp: "asc" },
            },
          },
        });

        if (latestJob && latestJob.logs.length > 0) {
          for (const log of latestJob.logs) {
            const data = JSON.stringify({
              stage: log.stage,
              stream: log.stream,
              message: log.message,
              timestamp: log.timestamp.toISOString(),
            });
            controller.enqueue(encoder.encode(`event: log\ndata: ${data}\n\n`));
          }
        }
      } catch (err) {
        console.error(`Error cargando logs históricos para ${tenantId}:`, err);
      }

      // 3. Suscribirse a eventos en vivo
      const unsubscribe = sseBroadcaster.subscribe(
        tenantId,
        (event: { type: string; payload: unknown }) => {
          try {
            const rawEvent = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
            controller.enqueue(encoder.encode(rawEvent));
          } catch (err) {
            console.error(`Error enviando SSE para ${tenantId}:`, err);
          }
        }
      );

      // Heartbeat periódico para mantener la conexión viva a través de proxies
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      // Limpieza cuando el cliente cierra la conexión
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Ignorar error al cerrar si ya está cerrado
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
