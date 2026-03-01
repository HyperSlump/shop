import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { getBlogIndex, getBlogPost } from '@/lib/mdx';

export const revalidate = 300;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function generateStaticParams() {
  const posts = await getBlogIndex();
  return posts.map(({ slug }) => ({ slug }));
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) {
    return notFound();
  }

  const dateLabel = post.frontmatter.date
    ? new Date(post.frontmatter.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="flex-1 w-full px-4 md:px-7 lg:px-8 py-10 md:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <PageBreadcrumb
          items={[
            { label: 'store', href: '/' },
            { label: 'blog', href: '/blog' },
            { label: post.frontmatter.title },
          ]}
          className="mb-2"
        />

        <header className="space-y-5 border-b border-primary/15 pb-7">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {dateLabel && <span>{dateLabel}</span>}
            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
              <>
                <span className="text-border">/</span>
                <span className="text-primary/70">{post.frontmatter.tags.join(' / ')}</span>
              </>
            )}
            <span className="text-border">/</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h1 className="heading-h1 text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.95] text-foreground">
            {post.frontmatter.title}
          </h1>
          {post.frontmatter.excerpt && (
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {post.frontmatter.excerpt}
            </p>
          )}
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/60">
            by hyper$lump lab
          </p>
        </header>

        {post.frontmatter.cover && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-border/60 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <Image
              src={post.frontmatter.cover}
              alt={post.frontmatter.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12">
          <aside className="lg:sticky lg:top-24 h-fit rounded-xl border border-border/50 bg-background/70 p-4 md:p-5">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">article</p>
                <p className="mt-1 text-sm text-foreground/90">{post.wordCount} words</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">time</p>
                <p className="mt-1 text-sm text-foreground/90">{post.readingMinutes} min read</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">format</p>
                <p className="mt-1 text-sm text-foreground/90">field note</p>
              </div>
            </div>
          </aside>

          <article className="rounded-2xl border border-border/50 bg-background/50 p-5 md:p-8 lg:p-10 text-[1.02rem] md:text-[1.07rem] leading-8 text-foreground/88
            [&>p]:my-5
            [&>p:first-of-type]:text-lg [&>p:first-of-type]:leading-9 [&>p:first-of-type]:text-foreground/95
            [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:text-2xl md:[&>h2]:text-3xl [&>h2]:font-semibold [&>h2]:tracking-tight [&>h2]:text-foreground
            [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-xl md:[&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-foreground
            [&>h4]:mt-6 [&>h4]:mb-3 [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:text-foreground
            [&>ul]:my-5 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6
            [&>ol]:my-5 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-6
            [&>blockquote]:my-8 [&>blockquote]:border-l-2 [&>blockquote]:border-primary/70 [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-foreground/80
            [&>hr]:my-10 [&>hr]:border-border/60
            [&_img]:my-8 [&_img]:w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border/60 [&_img]:shadow-[0_18px_50px_rgba(0,0,0,0.25)]
            [&_iframe]:my-8 [&_iframe]:block [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-border/60 [&_iframe]:shadow-[0_18px_50px_rgba(0,0,0,0.25)]
            [&_a]:text-primary [&_a:hover]:underline
            [&_strong]:text-foreground
            [&_code]:rounded-sm [&_code]:bg-foreground/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]
          ">
            {post.content}
          </article>
        </section>

        <div className="flex items-center justify-between pt-8 border-t border-border/40">
          <Link href="/blog" className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors">
            &larr; back to blog
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            hyper$lump // signal log
          </span>
        </div>
      </div>
    </div>
  );
}
