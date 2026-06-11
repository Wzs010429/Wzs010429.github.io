import type { Metadata } from 'next';
import Link from 'next/link';
import { getNotes } from '@/lib/postContent';

export const metadata: Metadata = {
  title: 'Note',
  description: 'Reading notes, thoughts, and short writings.',
};

export default function NoteIndexPage() {
  const notes = getNotes();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-primary mb-4">Note</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-500 mb-8 max-w-2xl">
        Reading notes, thoughts, and short writings.
      </p>
      <div className="space-y-4">
        {notes.map((note) => (
          <Link
            key={note.slug}
            href={`/post/note/${note.slug}`}
            className="block rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors duration-200"
          >
            <div className="flex justify-between gap-4">
              <h2 className="text-xl font-semibold text-primary">{note.title}</h2>
              {note.date && <span className="text-sm text-neutral-500">{note.date}</span>}
            </div>
            {note.summary && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-500">{note.summary}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
