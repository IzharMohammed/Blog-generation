import Groq from 'groq-sdk';

// Thin wrapper around GROQ SDK to create a chat client
export function createGroqClient(apiKey = process.env.GROQ_API_KEY): Groq {
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not set');
    }
    return new Groq({ apiKey });
}

export type ChatModel = 'llama-3.1-8b-instant' | 'llama-3.1-70b-versatile' | string;

export async function generateTitle(client: Groq, model: ChatModel, topic: string): Promise<string> {
    const prompt = `You are an expert blog content writer. Use Markdown formatting. Generate a creative, SEO-friendly blog title for the topic: "${topic}".`;
    const resp = await client.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: 'You generate concise, catchy titles.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
    });
    const content = resp.choices?.[0]?.message?.content ?? '';
    return content.trim();
}

export async function generateContent(client: Groq, model: ChatModel, topic: string, title: string): Promise<string> {
    const prompt = `You are an expert blog writer. Use Markdown formatting. Generate a detailed blog post with clear sections and subheadings for the topic: "${topic}". Title: ${title}.`;
    const resp = await client.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: 'You write detailed, well-structured Markdown content.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
    });
    const content = resp.choices?.[0]?.message?.content ?? '';
    return content.trim();
}
