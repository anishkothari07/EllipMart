import { NextRequest } from "next/server";
import { sseManager } from "@/lib/modules/notification/sse.manager";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "anonymous";

  const stream = new ReadableStream({
    start(controller) {
      const sendFn = (data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch {}
      };

      sseManager.addClient(userId, sendFn);

      // Initial heartbeat
      controller.enqueue(new TextEncoder().encode(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`));

      req.signal.addEventListener("abort", () => {
        sseManager.removeClient(userId, sendFn);
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
