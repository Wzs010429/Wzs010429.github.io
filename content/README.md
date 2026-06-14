# Content Editing Guide

Most visible website content lives in this folder. After editing these files, commit and push; GitHub Actions will build the site automatically.

## Profile and Homepage

- `bio.md`: main biography text on the homepage.
- `bio.md` frontmatter: short profile lists such as research interests and hobbies.
- `about.toml`: homepage section layout.
- `news.md`: news shown on the News page and parsed for the homepage News list.

News format:

```md
- **2026-06** Your news text here.
```

## CV

- `cv.md`: CV page content.
- `cv.toml`: CV page title and Markdown source.
- PDF files live in `public/` and are linked as `/CV_CN.pdf` or `/CV_Eng.pdf`.

## Teaching, Services, and Awards

These pages now use Markdown for the visible content:

- `teaching.md`
- `services.md`
- `awards.md`

Their `.toml` files only point the site to the Markdown source.

## Notes

Write notes in:

```text
content/notes/
```

The filename becomes the URL:

```text
content/notes/my-note.md -> /post/note/my-note/
```

Files beginning with `_`, such as `_template.md`, are ignored by the site.

## Gallery

Album text lives in:

```text
content/gallery/
```

Photos live in:

```text
public/post/gallery/
```

To add an album:

1. Create `content/gallery/album-slug.md`.
2. Create `public/post/gallery/album-slug/`.
3. Put image files in that photo folder.

The site automatically scans image files in the photo folder. Supported extensions are `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, and `.avif`.

Album Markdown format:

```md
+++
title = "Album Title"
description = "Short text for the gallery index."
date = "2026-06"
cover = "cover-image.webp"
+++

Longer album notes can go here.
```

## Publications

- `publications.bib`: publication data in BibTeX format.
- `publications.toml`: publication page title, description, and source file.
- `public/papers/`: paper preview images, slides, posters, and PDFs.

Use fields such as `selected = {true}`, `preview = {image.png}`, `description = {...}`, `code = {...}`, `slides = {...}`, and `poster = {...}` inside each BibTeX entry when needed.
