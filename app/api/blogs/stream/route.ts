import { NextRequest } from 'next/server';
import { GenerateBlogBodySchema } from '../../../../lib/validation/blog';
import { createGroqClient, generateTitle, streamContent } from '../../../../lib/llm/groq';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic } = GenerateBlogBodySchema.parse(body);

        const client = createGroqClient();
        const title = await generateTitle(client, 'llama-3.1-8b-instant', topic);

        const stream = new ReadableStream<string>({
            async start(controller) {
                // Send an initial event for title
                controller.enqueue(`event: title\ndata: ${JSON.stringify(title)}\n\n`);
                try {
                    for await (const token of streamContent(client, 'llama-3.1-8b-instant', topic, title)) {
                        // Stream tokens as SSE data events
                        controller.enqueue(`data: ${JSON.stringify(token)}\n\n`);
                    }
                    controller.enqueue(`event: end\ndata: done\n\n`);
                } catch (e) {
                    controller.enqueue(`event: error\ndata: ${JSON.stringify((e as Error).message)}\n\n`);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream as any, {
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        return new Response(JSON.stringify({ error: message }), {
            headers: { 'content-type': 'application/json' },
            status: 400,
        });
    }
}
