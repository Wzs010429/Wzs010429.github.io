import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Post',
  description: 'Life extension pages including notes and gallery.',
};

export default function PostPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-primary mb-4">Post</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-500 mb-8 max-w-2xl">
        A place for life extensions of this site: notes and gallery.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/post/note" className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-primary mb-2">Note</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-500">Reading notes, thoughts, and short writings.</p>
        </Link>
        <Link href="/post/gallery" className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-primary mb-2">Gallery</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-500">Photos and visual moments from life and travel.</p>
        </Link>
      </div>
    </div>
  );
}
