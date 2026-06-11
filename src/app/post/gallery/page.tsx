import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getGalleryAlbums } from '@/lib/postContent';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos and visual moments from life and travel.',
};

export default function GalleryPage() {
  const albums = getGalleryAlbums();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-primary mb-4">Gallery</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-500 mb-8 max-w-2xl">
        Photos and visual moments from life and travel.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {albums.map((album) => (
          <Link key={album.slug} href={`/post/gallery/${album.slug}`} className="group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-200">
            {album.cover && (
              <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800">
                <Image src={album.cover} alt={album.title} fill className="object-cover transition-transform duration-200 group-hover:scale-[1.02]" />
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between gap-4">
                <h2 className="text-xl font-semibold text-primary">{album.title}</h2>
                {album.date && <span className="text-sm text-neutral-500">{album.date}</span>}
              </div>
              {album.description && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-500">{album.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
