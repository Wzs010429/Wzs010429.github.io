import fs from 'fs';
import path from 'path';
import { parse } from 'smol-toml';

export interface NotePost {
  slug: string;
  title: string;
  date?: string;
  summary?: string;
  content: string;
}

export interface GalleryAlbum {
  slug: string;
  title: string;
  description?: string;
  cover?: string;
  date?: string;
  images: string[];
}

const CONTENT_DIR = path.join(process.cwd(), 'content');
const POSTS_DIR = path.join(CONTENT_DIR, 'posts');

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  if (!raw.startsWith('---')) {
    return { data: {}, content: raw };
  }

  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    return { data: {}, content: raw };
  }

  const frontmatter = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).trimStart();
  const data: Record<string, string> = {};

  frontmatter.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^:]+):\s*["']?(.*?)["']?$/);
    if (match) {
      data[match[1].trim()] = match[2].trim();
    }
  });

  return { data, content };
}

export function getNotes(): NotePost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs.readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const slug = name.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(POSTS_DIR, name), 'utf-8');
      const { data, content } = parseFrontmatter(raw);
      return {
        slug,
        title: data.title || slug,
        date: data.date,
        summary: data.summary,
        content,
      };
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function getNote(slug: string): NotePost | null {
  return getNotes().find((post) => post.slug === slug) || null;
}

export function getGalleryAlbums(): GalleryAlbum[] {
  const file = path.join(CONTENT_DIR, 'gallery.toml');
  if (!fs.existsSync(file)) return [];

  const data = parse(fs.readFileSync(file, 'utf-8')) as unknown as { albums?: GalleryAlbum[] };
  return data.albums || [];
}

export function getGalleryAlbum(slug: string): GalleryAlbum | null {
  return getGalleryAlbums().find((album) => album.slug === slug) || null;
}
