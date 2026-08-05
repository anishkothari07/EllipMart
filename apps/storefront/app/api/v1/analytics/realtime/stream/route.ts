export const dynamic = 'force-dynamic';
import { NextRequest } from "next/server";
import { RealtimeService } from '@corecart/commerce';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const sendFn = (data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch {}
      };

      RealtimeService.addClient(sendFn);

      // Initial heartbeat
      controller.enqueue(new TextEncoder().encode(`event: connected\ndata: ${JSON.stringify({ status: "connected" })}\n\n`));

      req.signal.addEventListener("abort", () => {
        RealtimeService.removeClient(sendFn);
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

