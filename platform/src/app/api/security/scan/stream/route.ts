import { sseBroadcaster } from "@/lib/orchestrator/sse-broadcaster";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Enviar evento inicial de conexión
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ message: "Conectado al stream de scanners DevSecOps" })}\n\n`)
      );

      // 2. Suscribirse al broadcaster del canal de scanners
      const unsubscribe = sseBroadcaster.subscribe("security-scanners", (event) => {
        try {
          const payloadStr = JSON.stringify(event.payload);
          controller.enqueue(
            encoder.encode(`event: ${event.type}\ndata: ${payloadStr}\n\n`)
          );
        } catch (err) {
          console.error("[SSE Scanners] Error enviando payload:", err);
        }
      });

      // 3. Keep-alive ping cada 15 segundos
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      // 4. Limpieza cuando el cliente cierra la conexión
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Ya cerrado
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
