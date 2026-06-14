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
  content?: string;
  cover?: string;
  date?: string;
  images: string[];
}

const CONTENT_DIR = path.join(process.cwd(), 'content');
const NOTES_DIR = path.join(CONTENT_DIR, 'notes');
const GALLERY_CONTENT_DIR = path.join(CONTENT_DIR, 'gallery');
const NOTE_ASSETS_DIR = path.join(process.cwd(), 'public', 'post', 'notes');
const GALLERY_ASSETS_DIR = path.join(process.cwd(), 'public', 'post', 'gallery');
const GALLERY_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const WEBP_SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

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

function parseTomlFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  if (!raw.startsWith('+++')) {
    return { data: {}, content: raw.trimStart() };
  }

  const end = raw.indexOf('\n+++', 3);
  if (end === -1) {
    return { data: {}, content: raw.trimStart() };
  }

  const frontmatter = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).trimStart();
  const data = parse(frontmatter) as Record<string, unknown>;

  return { data, content };
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function getNotes(): NotePost[] {
  if (!fs.existsSync(NOTES_DIR)) return [];

  return fs.readdirSync(NOTES_DIR)
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .map((name) => {
      const slug = name.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(NOTES_DIR, name), 'utf-8');
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

function splitAssetReference(src: string): { assetPath: string; suffix: string } {
  const match = src.match(/^([^?#]*)([?#].*)?$/);
  return {
    assetPath: match?.[1] || src,
    suffix: match?.[2] || '',
  };
}

function isExternalOrAbsoluteAsset(src: string): boolean {
  return (
    src.startsWith('/') ||
    src.startsWith('#') ||
    /^(?:https?:)?\/\//.test(src) ||
    /^(?:data|blob):/i.test(src)
  );
}

function normalizeRelativeAssetPath(src: string): string | null {
  const clean = src.replace(/\\/g, '/').replace(/^\.\/+/, '');
  if (!clean || clean.split('/').some((part) => part === '..')) {
    return null;
  }

  return clean;
}

function preferWebpAsset(assetRoot: string, slug: string, filename: string): string {
  const ext = path.posix.extname(filename).toLowerCase();
  if (!WEBP_SOURCE_EXTENSIONS.has(ext)) {
    return filename;
  }

  const webpFilename = `${filename.slice(0, -ext.length)}.webp`;
  const webpPath = path.join(assetRoot, slug, ...webpFilename.split('/'));
  return fs.existsSync(webpPath) ? webpFilename : filename;
}

function getPostAssetPath(assetRoot: string, publicPrefix: string, slug: string, filename: string): string {
  if (isExternalOrAbsoluteAsset(filename)) {
    return filename;
  }

  const { assetPath, suffix } = splitAssetReference(filename);
  const clean = normalizeRelativeAssetPath(assetPath);
  if (!clean) {
    return filename;
  }

  const resolved = preferWebpAsset(assetRoot, slug, clean);
  return `${publicPrefix}/${slug}/${resolved}${suffix}`;
}

export function getNoteAssetPath(slug: string, filename: string): string {
  return getPostAssetPath(NOTE_ASSETS_DIR, '/post/notes', slug, filename);
}

export function getGalleryAssetPath(slug: string, filename: string): string {
  return getPostAssetPath(GALLERY_ASSETS_DIR, '/post/gallery', slug, filename);
}

function getGalleryImagePath(slug: string, filename: string): string {
  return getGalleryAssetPath(slug, filename);
}

function getAlbumImages(slug: string): string[] {
  const albumDir = path.join(GALLERY_ASSETS_DIR, slug);
  if (!fs.existsSync(albumDir)) return [];

  return fs.readdirSync(albumDir)
    .filter((name) => !name.startsWith('.') && GALLERY_IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => getGalleryImagePath(slug, name));
}

export function getGalleryAlbums(): GalleryAlbum[] {
  if (!fs.existsSync(GALLERY_CONTENT_DIR)) return [];

  return fs.readdirSync(GALLERY_CONTENT_DIR)
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .map((name) => {
      const slug = name.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(GALLERY_CONTENT_DIR, name), 'utf-8');
      const { data, content } = parseTomlFrontmatter(raw);
      const images = getAlbumImages(slug);
      const cover = getStringValue(data.cover);
      const description = getStringValue(data.description) || content.trim();

      return {
        slug,
        title: getStringValue(data.title) || slug,
        description,
        content: content.trim(),
        cover: cover ? getGalleryImagePath(slug, cover) : images[0],
        date: getStringValue(data.date),
        images,
      };
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function getGalleryAlbum(slug: string): GalleryAlbum | null {
  return getGalleryAlbums().find((album) => album.slug === slug) || null;
}
