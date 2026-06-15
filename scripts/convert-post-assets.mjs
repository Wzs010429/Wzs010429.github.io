#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const ASSET_ROOTS = [
  path.join(ROOT, 'public', 'post', 'gallery'),
  path.join(ROOT, 'public', 'post', 'notes'),
];

const RASTER_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const PDF_EXTENSIONS = new Set(['.pdf']);
const SOURCE_EXTENSIONS = new Set([...RASTER_EXTENSIONS, ...PDF_EXTENSIONS]);
const QUALITY = Number.parseInt(process.env.WEBP_QUALITY || '86', 10);
const KEEP_ORIGINALS = process.env.KEEP_ORIGINALS === '1';
const DELETE_PDF_ORIGINALS = process.env.DELETE_PDF_ORIGINALS === '1';

let sharp;

async function loadSharp() {
  if (sharp) {
    return sharp;
  }

  try {
    ({ default: sharp } = await import('sharp'));
    return sharp;
  } catch {
    console.error('Could not load sharp. Run npm install before converting post assets.');
    process.exit(1);
  }
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  if (!(await pathExists(dir))) {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return fullPath;
  }));

  return files.flat();
}

async function removeIfRequested(source, target, ext) {
  const shouldDelete = RASTER_EXTENSIONS.has(ext)
    ? !KEEP_ORIGINALS
    : DELETE_PDF_ORIGINALS;

  if (shouldDelete && source !== target) {
    await fs.rm(source);
    return true;
  }

  return false;
}

async function convertFile(source) {
  const ext = path.extname(source).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) {
    return { status: 'ignored', source };
  }

  const target = `${source.slice(0, -ext.length)}.webp`;
  const sourceStat = await fs.stat(source);

  if (await pathExists(target)) {
    const targetStat = await fs.stat(target);
    if (targetStat.mtimeMs >= sourceStat.mtimeMs) {
      const deleted = await removeIfRequested(source, target, ext);
      return { status: deleted ? 'deleted-original' : 'skipped', source, target };
    }
  }

  const tmpTarget = `${target}.tmp-${process.pid}.webp`;

  try {
    const sharpConverter = await loadSharp();
    const pipeline = PDF_EXTENSIONS.has(ext)
      ? sharpConverter(source, { density: 180, pages: 1 })
      : sharpConverter(source).rotate();

    await pipeline.webp({ quality: QUALITY }).toFile(tmpTarget);
    await fs.rename(tmpTarget, target);
    const deleted = await removeIfRequested(source, target, ext);
    return { status: deleted ? 'converted-deleted-original' : 'converted', source, target };
  } catch (error) {
    await fs.rm(tmpTarget, { force: true });
    return {
      status: 'error',
      source,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const files = (await Promise.all(ASSET_ROOTS.map(walk))).flat();
const sourceFiles = files.filter((file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()));
const results = [];

if (sourceFiles.length === 0) {
  console.log('No post assets needed conversion.');
  process.exit(0);
}

for (const file of sourceFiles) {
  results.push(await convertFile(file));
}

const changed = results.filter((result) => (
  result.status === 'converted' ||
  result.status === 'converted-deleted-original' ||
  result.status === 'deleted-original'
));
const errors = results.filter((result) => result.status === 'error');

for (const result of changed) {
  const source = path.relative(ROOT, result.source);
  const target = result.target ? path.relative(ROOT, result.target) : '';
  if (result.status === 'deleted-original') {
    console.log(`Removed original after existing WebP: ${source}`);
  } else {
    console.log(`Converted ${source} -> ${target}`);
  }
}

for (const result of errors) {
  console.error(`Failed to convert ${path.relative(ROOT, result.source)}: ${result.error}`);
}

if (errors.length > 0) {
  process.exit(1);
}

if (changed.length === 0) {
  console.log('No post assets needed conversion.');
}
