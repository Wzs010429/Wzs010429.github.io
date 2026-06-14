/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getGalleryAlbum, getGalleryAlbums, getGalleryAssetPath } from '@/lib/postContent';

export function generateStaticParams() {
  return getGalleryAlbums().map((album) => ({ album: album.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ album: string }> }): Promise<Metadata> {
  const { album: slug } = await params;
  const album = getGalleryAlbum(slug);
  return album ? { title: album.title, description: album.description } : {};
}

export default async function GalleryAlbumPage({ params }: { params: Promise<{ album: string }> }) {
  const { album: slug } = await params;
  const album = getGalleryAlbum(slug);
  if (!album) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-primary mb-4">{album.title}</h1>
      {album.description && <p className="text-lg text-neutral-600 dark:text-neutral-500 mb-8 max-w-2xl">{album.description}</p>}
      {album.content && (
        <div className="text-neutral-700 dark:text-neutral-600 leading-relaxed mb-8 max-w-3xl">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="text-2xl font-serif font-bold text-primary mt-8 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-primary mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>,
              a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline" />,
              strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
              img: ({ src, alt, node: _node, ...props }) => {
                const imageSrc = typeof src === 'string' ? getGalleryAssetPath(slug, src) : src;

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
            {album.content}
          </ReactMarkdown>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {album.images.map((src) => (
          <div key={src} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <Image src={src} alt={album.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
