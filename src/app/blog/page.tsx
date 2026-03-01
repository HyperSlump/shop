import Image from 'next/image';
import Link from 'next/link';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { getBlogIndex } from '@/lib/mdx';

export const revalidate = 300;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function BlogPage() {
  const posts = await getBlogIndex();

  return (
    <div className="flex-1 w-full px-4 md:px-7 lg:px-8 py-10">
      <div className="w-full space-y-10">
        <PageBreadcrumb
          items={[
            { label: 'store', href: '/' },
            { label: 'blog' },
          ]}
          className="mb-2"
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-8 gap-6">
          <div className="space-y-2 pt-4">
            <h1 className="heading-h1 text-4xl md:text-6xl lg:text-7xl">
              signal log
            </h1>
            <p className="text-sm text-muted max-w-2xl">
              VST plugin reviews, production tricks, and field notes from the hyper$lump lab.
            </p>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
            updated every drop
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="border border-border/60 rounded-lg p-8 bg-background/60">
            <p className="text-sm text-muted-foreground">No posts yet. New transmissions will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {posts.map((post) => {
              const dateLabel = post.date
                ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '';

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group relative rounded-xl overflow-hidden border border-border/60 bg-background/60 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/50 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
                >
                  {post.cover && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition duration-300 group-hover:scale-[1.02] group-hover:brightness-105"
                        priority={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] bg-black/60 text-white rounded-sm border border-white/10">
                        {dateLabel}
                      </span>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-primary/70">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {post.tags?.join(' / ') || 'review'}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-foreground/70 group-hover:text-primary flex items-center gap-2 pt-1">
                      read article
                      <span className="translate-y-[1px]">-&gt;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
