import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
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
          components={{
            h2: ({ children }) => <h2 className="text-2xl font-serif font-bold text-primary mt-8 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">{children}</h2>,
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline" />,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>,
            strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
            img: ({ src, alt, node: _node, ...props }) => {
              const imageSrc = typeof src === 'string' ? getNoteAssetPath(slug, src) : src;

              return (
                <span className="block my-6 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <img
                    {...props}
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
