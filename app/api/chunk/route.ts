const TOTAL_CHUNKS = 10;

const RANDOM_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Streaming data chunk received from the server.",
  "Next.js Route Handlers support Web Streams API natively.",
  "Processing your request in real-time with chunked transfer.",
  "Each chunk is sent with a 2-second delay for demonstration.",
  "ReadableStream enables progressive data delivery over HTTP.",
  "Chunk delivery here uses TextEncoder under the hood.",
  "This simulates a long-running server operation or LLM response.",
  "Chunked responses are great for real-time dashboards and feeds.",
  "Stream complete — all 10 chunks have been delivered successfully!",
];

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < TOTAL_CHUNKS; i++) {
        const message = `[Chunk ${i + 1}/${TOTAL_CHUNKS}] ${RANDOM_TEXTS[i]}\n`;
        controller.enqueue(encoder.encode(message));
        // 2-second delay between chunks (skip delay after the last chunk)
        if (i < TOTAL_CHUNKS - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Tell the client upfront how many chunks to expect
      "X-Total-Chunks": String(TOTAL_CHUNKS),
      // Prevents proxies / nginx from buffering the stream
      "X-Accel-Buffering": "no",
      "X-Content-Type-Options": "nosniff",
      // Disable compression so chunks are not buffered by the compression layer
      "Cache-Control": "no-cache",
    },
  });
}
