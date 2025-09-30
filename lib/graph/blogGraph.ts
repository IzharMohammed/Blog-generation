import { createGroqClient, generateContent, generateTitle, ChatModel } from '../llm/groq';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';

// Types carried through the graph
export type BlogState = {
    topic: string;
    blog?: { title: string; content?: string; outline?: string[] };
    seo?: { summary?: string; tags?: string[] };
};

// Optional: pick a model name once
const defaultModel: ChatModel = 'llama-3.1-8b-instant';

// Node: generate a title
async function title_creation(state: BlogState) {
    const client = createGroqClient();
    const title = await generateTitle(client, defaultModel, state.topic);
    return { blog: { ...(state.blog ?? {}), title } } as Partial<BlogState>;
}

// Node: create an outline (simple heuristic via title/topic)
async function outline_generation(state: BlogState) {
    const client = createGroqClient();
    // Reuse content generation with a prompt tweak by injecting pseudo-outline via title
    const outlinePrompt = `Create a short outline (5-7 bullets) for a blog about "${state.topic}" titled "${state.blog?.title}". Only return bullets, no extra text.`;
    const content = await client.chat.completions.create({
        model: defaultModel,
        messages: [
            { role: 'system', content: 'You write concise outlines as bullet points.' },
            { role: 'user', content: outlinePrompt },
        ],
        temperature: 0.5,
    });
    const bullets = content.choices?.[0]?.message?.content?.split('\n').filter(Boolean) ?? [];
    return { blog: { ...(state.blog ?? {}), outline: bullets } } as Partial<BlogState>;
}

// Node: generate full content
async function content_generation(state: BlogState) {
    const client = createGroqClient();
    const title = state.blog?.title ?? 'Untitled';
    const content = await generateContent(client, defaultModel, state.topic, title);
    return { blog: { ...(state.blog ?? {}), content } } as Partial<BlogState>;
}

// Node: SEO summary
async function seo_summary(state: BlogState) {
    const client = createGroqClient();
    const prompt = `Summarize this blog in 1-2 sentences for SEO meta description:\n\n${state.blog?.content ?? ''}`;
    const resp = await client.chat.completions.create({
        model: defaultModel,
        messages: [
            { role: 'system', content: 'You write short, catchy SEO descriptions.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.6,
    });
    const summary = resp.choices?.[0]?.message?.content?.trim() ?? '';
    return { seo: { ...(state.seo ?? {}), summary } } as Partial<BlogState>;
}

// Node: tags extraction
async function tags_extraction(state: BlogState) {
    const client = createGroqClient();
    const prompt = `Propose 5-8 short SEO tags (comma-separated) for this blog content:\n\n${state.blog?.content ?? ''}`;
    const resp = await client.chat.completions.create({
        model: defaultModel,
        messages: [
            { role: 'system', content: 'You create concise, relevant tags only.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
    });
    const raw = resp.choices?.[0]?.message?.content ?? '';
    const tags = raw
        .replace(/\n/g, ' ')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    return { seo: { ...(state.seo ?? {}), tags } } as Partial<BlogState>;
}

const State = Annotation.Root({
    topic: Annotation<string>(),
    blog: Annotation<{ title: string; content?: string; outline?: string[] }>(),
    seo: Annotation<{ summary?: string; tags?: string[] }>(),
});

// In a LangGraph (like StateGraph from @langchain/langgraph), the special constants START and END represent the entry and exit points of the graph, not actual nodes with logic. 
// The first "real" node you add (like 'title_creation') is where your workflow begins after the graph starts. 
// The edge `.addEdge(START, 'title_creation')` means: when the graph starts, go to the 'title_creation' node first. 
// So, START is not a node you implement—it's just a marker for where the graph begins. 
// That's why the first node you see in the code is 'title_creation', not START.

export function compileBlogGraph() {
    return new StateGraph(State)
        .addNode('title_creation', title_creation)
        .addNode('outline_generation', outline_generation)
        .addNode('content_generation', content_generation)
        .addNode('seo_summary', seo_summary)
        .addNode('tags_extraction', tags_extraction)
        // The graph starts at START, which immediately transitions to 'title_creation'
        .addEdge(START, 'title_creation')
        .addEdge('title_creation', 'outline_generation')
        .addEdge('outline_generation', 'content_generation')
        .addEdge('content_generation', 'seo_summary')
        .addEdge('seo_summary', 'tags_extraction')
        .addEdge('tags_extraction', END)
        .compile();
}

// Convenience function to run the graph
export async function runTopicGraph(state: BlogState) {
    if (!state.topic) throw new Error('Topic is required');
    const app = compileBlogGraph();
    return await app.invoke(state);
}
