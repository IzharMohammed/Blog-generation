"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to generate blog");
      setData(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl font-bold tracking-tight mb-6"
        >
          LangGraph Blog Generator (GROQ)
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-slate-600 mb-8"
        >
          This app builds a small graph of nodes: title → outline → content →
          SEO summary → tags.
        </motion.p>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-3 mb-10"
        >
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Modern TypeScript patterns"
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="submit"
            disabled={loading || !topic}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </motion.form>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {data?.blog?.title && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Title</h2>
            <p className="text-lg">{data.blog.title}</p>
          </section>
        )}

        {data?.blog?.outline?.length ? (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Outline</h2>
            <ul className="list-disc pl-6 space-y-1">
              {data.blog.outline.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {data?.blog?.content && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Content</h2>
            <article className="prose prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {data.blog.content}
              </ReactMarkdown>
            </article>
          </section>
        )}

        {(data?.seo?.summary || data?.seo?.tags?.length) && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">SEO</h2>
            {data.seo.summary && (
              <p className="mb-2 text-slate-700">{data.seo.summary}</p>
            )}
            {data.seo.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {data.seo.tags.map((t: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}
