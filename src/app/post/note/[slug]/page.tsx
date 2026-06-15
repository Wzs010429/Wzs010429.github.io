/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { getNote, getNoteAssetPath, getNotes } from '@/lib/postContent';

export function generateStaticParams() {
  return getNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  return note ? { title: note.title, description: note.summary } : {};
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-primary mb-2">{note.title}</h1>
      {note.date && <p className="text-sm text-neutral-500 mb-8">{note.date}</p>}
      <div className="text-neutral-700 dark:text-neutral-600 leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-serif font-bold text-primary mt-10 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-serif font-bold text-primary mt-8 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-serif font-semibold text-primary mt-6 mb-3">{children}</h3>,
            h4: ({ children }) => <h4 className="text-lg font-serif font-semibold text-primary mt-5 mb-2">{children}</h4>,
            h5: ({ children }) => <h5 className="text-base font-serif font-semibold text-primary mt-4 mb-2">{children}</h5>,
            h6: ({ children }) => <h6 className="text-sm font-serif font-semibold text-primary mt-4 mb-2">{children}</h6>,
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline" />,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            del: ({ children }) => <del className="line-through text-neutral-400">{children}</del>,
            hr: () => <hr className="my-8 border-neutral-200 dark:border-neutral-800" />,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent pl-4 my-4 text-neutral-600 dark:text-neutral-400 italic">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border-collapse border border-neutral-200 dark:border-neutral-700">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-neutral-100 dark:bg-neutral-800">{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className="border-b border-neutral-200 dark:border-neutral-700 even:bg-neutral-50 dark:even:bg-neutral-800/50">{children}</tr>,
            th: ({ children }) => <th className="border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-left font-semibold text-primary text-sm">{children}</th>,
            td: ({ children }) => <td className="border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm">{children}</td>,
            pre: ({ children }) => (
              <pre className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 my-4 overflow-x-auto text-sm leading-relaxed border border-neutral-200 dark:border-neutral-700">
                {children}
              </pre>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-neutral-100 dark:bg-neutral-800 text-accent dark:text-accent-light rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <code className={`${className} text-sm font-mono`} {...props}>
                  {children}
                </code>
              );
            },
            img: ({ src, alt }) => {
              const imageSrc = typeof src === 'string' ? getNoteAssetPath(slug, src) : src;
              return (
                <span className="block my-6 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <img
                    src={imageSrc}
                    alt={alt || ''}
                    loading="lazy"
                    className="block w-full h-auto"
                  />
                </span>
              );
            },
          }}
        >
          {note.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
