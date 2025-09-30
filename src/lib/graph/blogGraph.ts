import { createGroqClient, generateContent, generateTitle, ChatModel } from '../llm/groq';

export type BlogState = {
    topic: string;
    blog?: { title: string; content?: string };
};

export async function runTopicGraph(state: BlogState, model: ChatModel = 'llama-3.1-8b-instant') {
    if (!state.topic) throw new Error('Topic is required');
    const client = createGroqClient();
    const title = await generateTitle(client, model, state.topic);
    const content = await generateContent(client, model, state.topic, title);
    return { blog: { title, content } } as const;
}
