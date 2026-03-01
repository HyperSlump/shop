import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import { compileMDX } from 'next-mdx-remote/rsc';

function normalizeMdxSource(source: string) {
  return source
    .replace(/^\uFEFF/, '')
    .replace(/^\s+(?=---\r?\n)/, '');
}

async function resolveBlogDir() {
  const cwdDir = path.join(process.cwd(), 'content', 'blog');
  try {
    const stat = await fs.stat(cwdDir);
    if (stat.isDirectory()) return cwdDir;
  } catch {
    // fall through
  }

  const fileDir = path.dirname(fileURLToPath(import.meta.url));
  const relativeDir = path.join(fileDir, '../../content/blog');
  try {
    const stat = await fs.stat(relativeDir);
    if (stat.isDirectory()) return relativeDir;
  } catch {
    // fall through
  }

  return cwdDir; // default even if missing
}

export type BlogFrontmatter = {
  title: string;
  date: string;
  excerpt?: string;
  cover?: string;
  tags?: string[];
};

export type BlogIndexItem = BlogFrontmatter & { slug: string };

export async function getBlogIndex(): Promise<BlogIndexItem[]> {
  const BLOG_DIR = await resolveBlogDir();
  const entries = await fs.readdir(BLOG_DIR);
  const posts = await Promise.all(
    entries
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const fullPath = path.join(BLOG_DIR, file);
        const rawSource = await fs.readFile(fullPath, 'utf-8');
        const source = normalizeMdxSource(rawSource);
        const { data } = matter(source);
        return {
          ...(data as BlogFrontmatter),
          slug: file.replace(/\.mdx$/, ''),
        } as BlogIndexItem;
      })
  );

  return posts.sort((a, b) => {
    const aDate = new Date(a.date || '').getTime();
    const bDate = new Date(b.date || '').getTime();
    return bDate - aDate;
  });
}

export async function getBlogPost(slug: string) {
  if (!slug) return null;
  const safeSlug = String(slug).trim();

  const BLOG_DIR = await resolveBlogDir();

  // 1) Try direct read first (fast path)
  const directPath = path.join(BLOG_DIR, `${safeSlug}.mdx`);
  const candidates = [directPath];

  // 2) Fallback: case-insensitive match from index
  try {
    const index = await getBlogIndex();
    const matched = index.find((p) => typeof p.slug === 'string' && p.slug.toLowerCase() === safeSlug.toLowerCase());
    if (matched) {
      candidates.push(path.join(BLOG_DIR, `${matched.slug}.mdx`));
    }
  } catch {
    // ignore index errors; direct read may still succeed
  }

  let source: string | null = null;
  let usedPath = '';
  for (const candidate of candidates) {
    try {
      const rawSource = await fs.readFile(candidate, 'utf-8');
      source = normalizeMdxSource(rawSource);
      usedPath = candidate;
      break;
    } catch (error: any) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }
  }

  if (!source) return null;

  const parsedSource = matter(source);
  const wordCount = parsedSource.content
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 220));

  const { content, frontmatter } = await compileMDX<BlogFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return {
    slug: path.basename(usedPath).replace(/\.mdx$/, ''),
    frontmatter,
    content,
    wordCount,
    readingMinutes,
  };
}
