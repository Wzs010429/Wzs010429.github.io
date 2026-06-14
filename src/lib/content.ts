import fs from 'fs';
import path from 'path';
import { parse } from 'smol-toml';

const DEFAULT_CONTENT_DIR = 'content';

function normalizeLocale(locale: string): string {
  return locale.trim().replace('_', '-').toLowerCase();
}

function getCandidateFilePaths(filename: string, locale?: string): string[] {
  const candidates: string[] = [];

  if (locale) {
    candidates.push(path.join(process.cwd(), `${DEFAULT_CONTENT_DIR}_${normalizeLocale(locale)}`, filename));
  }

  candidates.push(path.join(process.cwd(), DEFAULT_CONTENT_DIR, filename));

  return candidates;
}

function readFirstAvailableFile(filename: string, locale?: string): string {
  const candidates = getCandidateFilePaths(filename, locale);

  for (const filePath of candidates) {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`Error loading file ${filePath}:`, error);
      }
    }
  }

  if (locale) {
    console.warn(`Missing localized file \"${filename}\" for locale \"${locale}\", and no fallback found in content/.`);
  } else {
    console.warn(`Missing file \"${filename}\" in content/.`);
  }

  return '';
}

function parseTomlFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
  if (!content.startsWith('+++')) {
    return { data: {}, content };
  }

  const end = content.indexOf('\n+++', 3);
  if (end === -1) {
    return { data: {}, content };
  }

  const frontmatter = content.slice(3, end).trim();
  const body = content.slice(end + 4).trimStart();

  try {
    return {
      data: parse(frontmatter) as Record<string, unknown>,
      content: body,
    };
  } catch (error) {
    console.error('Error parsing markdown frontmatter:', error);
    return { data: {}, content: body };
  }
}

export function getMarkdownContent(filename: string, locale?: string): string {
  return parseTomlFrontmatter(readFirstAvailableFile(filename, locale)).content;
}

export function getMarkdownFrontmatter<T = Record<string, unknown>>(filename: string, locale?: string): T | null {
  const content = readFirstAvailableFile(filename, locale);
  if (!content) {
    return null;
  }

  return parseTomlFrontmatter(content).data as T;
}

export function getBibtexContent(filename: string, locale?: string): string {
  return readFirstAvailableFile(filename, locale);
}

export function getTomlContent<T>(filename: string, locale?: string): T | null {
  const content = readFirstAvailableFile(filename, locale);
  if (!content) {
    return null;
  }

  try {
    return parse(content) as unknown as T;
  } catch (error) {
    console.error(`Error parsing TOML file ${filename}:`, error);
    return null;
  }
}

export function getPageConfig<T = unknown>(pageName: string, locale?: string): T | null {
  return getTomlContent<T>(`${pageName}.toml`, locale);
}
