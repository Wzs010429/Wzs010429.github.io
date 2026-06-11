import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getGalleryAlbum, getGalleryAlbums } from '@/lib/postContent';

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
