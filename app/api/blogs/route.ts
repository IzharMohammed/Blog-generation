
import { NextRequest } from 'next/server';
import { GenerateBlogBodySchema } from '../../../lib/validation/blog';
import { runTopicGraph } from '../../../lib/graph/blogGraph';


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
