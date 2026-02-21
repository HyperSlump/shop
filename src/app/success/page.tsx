import Link from 'next/link';
import { stripe } from '@/lib/stripe/server';
import { IconArrowRight, IconDownload } from '@tabler/icons-react';
import SuccessSummary from '@/components/SuccessSummary';
import { getProductFile } from '@/lib/products';

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id: string }>;
}) {
    const { session_id: sessionId } = await searchParams;

    if (!sessionId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent text-foreground font-mono">
                <div className="border border-alert/30 p-8 rounded bg-alert/10 backdrop-blur-sm">
                    <h1 className="heading-h1 text-xl mb-4">ERROR: SESSION_NOT_FOUND</h1>
                    <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground transition-colors">Return to Base</Link>
                </div>
            </div>
        );
    }

    // Verify session
    let session;
    let lineItems;
    try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items']
        });
        lineItems = session.line_items?.data || [];
    } catch {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent text-foreground font-mono">
                <div className="border border-alert/30 p-8 rounded bg-alert/10 backdrop-blur-sm">
                    <h1 className="heading-h1 text-xl mb-4">ERROR: INVALID_TRANSMISSION</h1>
                    <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground transition-colors">Return to Base</Link>
                </div>
            </div>
        );
    }

    // Map price IDs to file URLs
    const downloads = lineItems.map(item => {
        const priceId = item.price?.id;
        const fileInfo = getProductFile(priceId);

        let productImage: string | undefined;
        if (item.price?.product && typeof item.price.product !== 'string' && 'images' in item.price.product) {
            productImage = item.price.product.images[0];
        }

        return {
            id: priceId || 'unknown', // persist ID for localStorage
            name: item.description || 'Unknown Asset',
            url: fileInfo.url,
            label: fileInfo.label,
            amount: (item.amount_total || 0) / 100,
            image: productImage
        };
    });


    const totalAmount = (session.amount_total || 0) / 100;
    const isMultiple = downloads.length > 1;

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-foreground selection:bg-primary/30 selection:text-foreground">
            <div className="flex-1 flex flex-col lg:flex-row">

                {/* LEFT: Order Summary / Confirmation Details (Accordion on Mobile) */}
                <div className="lg:w-1/2 bg-card/55 backdrop-blur-md border-r border-border flex flex-col relative order-2 lg:order-1">
                    {/* Desktop Static / Mobile Accordion Container */}
                    <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto lg:ml-auto lg:mr-0 w-full px-8 md:px-12 xl:px-20 py-12 lg:py-16">
                        <SuccessSummary downloads={downloads} totalAmount={totalAmount} sessionId={sessionId} />
                    </div>
                </div>

                {/* RIGHT: Download Content Area */}
                <div className="lg:w-1/2 bg-background/45 backdrop-blur-md flex flex-col relative order-1 lg:order-2">
                    <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto lg:mr-auto lg:ml-0 w-full px-8 md:px-12 xl:px-20 py-16 lg:py-20">

                        {/* Status Label */}
                        <div className="font-mono text-[9px] font-bold text-primary uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
                            Success Transaction
                        </div>

                        {/* Headline */}
                        <h1 className="heading-h1 text-3xl md:text-5xl lg:text-7xl text-foreground mb-8">
                            Your downloads
                        </h1>

                        <p className="font-mono text-xs text-muted leading-relaxed mb-12 max-w-sm uppercase tracking-wide">
                            Your purchased items have been unlocked. A secure downlink frequency has been established for your coordinates.
                            Download links are ready below.
                        </p>

                        {/* Downloads Section Logic */}
                        <div className="space-y-6">
                            {isMultiple ? (
                                /* MULTIPLE: Condensed Text Links */
                                <div className="grid gap-4">
                                    {downloads.map((dl, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-5 border border-border bg-card/35 hover:bg-card/55 rounded-lg transition-all duration-300">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[8px] text-muted/80 uppercase tracking-widest mb-1">Item: {dl.name}</span>
                                                <span className="font-mono text-[10px] text-foreground font-bold uppercase tracking-widest group-hover:text-primary transition-colors">{dl.label}</span>
                                            </div>
                                            <a
                                                href={dl.url}
                                                className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase tracking-[0.2em] hover:text-foreground transition-colors border-b border-border pb-1"
                                            >
                                                Download <IconDownload size={10} stroke={2} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* SINGULAR: Simple Hyperlink */
                                <div className="py-10">
                                    <a
                                        href={downloads[0].url}
                                        className="inline-flex items-center gap-3 font-mono text-sm font-bold text-foreground hover:text-primary uppercase tracking-[0.2em] transition-all duration-300 group"
                                    >
                                        <IconDownload size={16} stroke={2} className="text-muted group-hover:text-primary transition-colors" />
                                        <span className="border-b border-border group-hover:border-primary pb-1">
                                            Download: {downloads[0].label}
                                        </span>
                                    </a>
                                </div>
                            )}

                            {/* Final CTA / Backup */}
                            <div className="pt-8 flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-[10px] font-mono text-muted uppercase tracking-widest">
                                    <span>Email Sent To:</span>
                                    <span className="text-foreground/80">{session.customer_details?.email}</span>
                                </div>
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 font-mono text-[10px] text-muted hover:text-primary uppercase tracking-[0.3em] transition-colors w-fit group"
                                >
                                    <IconArrowRight size={12} stroke={2} className="group-hover:translate-x-1 transition-transform" />
                                    Return to Catalog
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
