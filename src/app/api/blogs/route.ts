import { runTopicGraph } from '@/lib/graph/blogGraph';
import { GenerateBlogBodySchema } from '@/lib/validation/blog';
import { NextRequest } from 'next/server';


export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic } = GenerateBlogBodySchema.parse(body);

        const result = await runTopicGraph({ topic });

        return new Response(JSON.stringify({ data: result }), {
            headers: { 'content-type': 'application/json' },
            status: 200,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        return new Response(JSON.stringify({ error: message }), {
            headers: { 'content-type': 'application/json' },
            status: 400,
        });
    }
}
