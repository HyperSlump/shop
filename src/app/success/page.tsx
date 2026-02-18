import Link from 'next/link';
import { stripe } from '@/lib/stripe/server';
import { CheckCircle2, Download, Package, ArrowRight, ChevronDown } from 'lucide-react';
import SuccessSummary from '@/components/SuccessSummary';

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id: string }>;
}) {
    const { session_id: sessionId } = await searchParams;

    if (!sessionId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white font-mono">
                <div className="border border-red-500/20 p-8 rounded bg-red-500/5 backdrop-blur-sm">
                    <h1 className="text-xl font-bold mb-4 tracking-tighter uppercase font-mono">ERROR: SESSION_NOT_FOUND</h1>
                    <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">Return to Base</Link>
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
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white font-mono">
                <div className="border border-red-500/20 p-8 rounded bg-red-500/5 backdrop-blur-sm">
                    <h1 className="text-xl font-bold mb-4 tracking-tighter uppercase font-mono">ERROR: INVALID_TRANSMISSION</h1>
                    <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">Return to Base</Link>
                </div>
            </div>
        );
    }

    // Map price IDs to file URLs
    const PRODUCT_FILES: Record<string, { label: string, url: string }> = {
        'price_1T070gHlah70mYw2Oe7IA8q8': { label: 'HYPERSLUMP_01', url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip' },
        'price_1T077bHlah70mYw2Oa6IwZgB': { label: 'HYPERSLUMP_02', url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip' },
        'price_1T076PHlah70mYw2D01WCvIT': { label: 'HYPERSLUMP_03', url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip' },
        'price_1Szmy3Hlah70mYw2t6BkUO6O': { label: 'HYPERSLUMP_04', url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip' },
    };

    const downloads = lineItems.map(item => {
        const priceId = item.price?.id;
        const knownFile = priceId ? PRODUCT_FILES[priceId] : null;
        return {
            name: item.description || 'Unknown Asset',
            url: knownFile?.url || "https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/sample_product_1.zip",
            label: knownFile?.label || 'DOWNLOAD_ASSET',
            amount: (item.amount_total || 0) / 100
        };
    });

    const totalAmount = (session.amount_total || 0) / 100;
    const isMultiple = downloads.length > 1;

    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-white selection:text-black">
            <div className="flex-1 flex flex-col lg:flex-row">

                {/* LEFT: Order Summary / Confirmation Details (Accordion on Mobile) */}
                <div className="lg:w-1/2 bg-[#080808] border-r border-white/5 flex flex-col relative order-2 lg:order-1">
                    {/* Desktop Static / Mobile Accordion Container */}
                    <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto lg:ml-auto lg:mr-0 w-full px-8 md:px-12 xl:px-20 py-12 lg:py-16">
                        <SuccessSummary downloads={downloads} totalAmount={totalAmount} sessionId={sessionId} />
                    </div>
                </div>

                {/* RIGHT: Download Content Area */}
                <div className="lg:w-1/2 bg-[#0A0A0A] flex flex-col relative order-1 lg:order-2">
                    <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto lg:mr-auto lg:ml-0 w-full px-8 md:px-12 xl:px-20 py-16 lg:py-20">

                        {/* Status Label */}
                        <div className="font-mono text-[9px] font-bold text-primary uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
                            Success Transaction
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-gothic tracking-tighter text-white lowercase leading-[1] mb-8">
                            claim your downloads
                        </h1>

                        <p className="font-mono text-xs text-white/50 leading-relaxed mb-12 max-w-sm uppercase tracking-wide">
                            The digital assets have been unlocked. A secure downlink frequency has been established for your coordinates.
                            Download links are ready below.
                        </p>

                        {/* Downloads Section Logic */}
                        <div className="space-y-6">
                            {isMultiple ? (
                                /* MULTIPLE: Condensed Text Links */
                                <div className="grid gap-4">
                                    {downloads.map((dl, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition-all duration-300">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[8px] text-white/30 uppercase tracking-widest mb-1">Asset: {dl.name}</span>
                                                <span className="font-mono text-[10px] text-white font-bold uppercase tracking-widest group-hover:text-primary transition-colors">{dl.label}</span>
                                            </div>
                                            <a
                                                href={dl.url}
                                                className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors border-b border-white/10 pb-1"
                                            >
                                                Download <Download size={10} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* SINGULAR: Simple Hyperlink */
                                <div className="py-10">
                                    <a
                                        href={downloads[0].url}
                                        className="inline-flex items-center gap-3 font-mono text-sm font-bold text-white hover:text-primary uppercase tracking-[0.2em] transition-all duration-300 group"
                                    >
                                        <Download size={16} className="text-white/20 group-hover:text-primary transition-colors" />
                                        <span className="border-b border-white/10 group-hover:border-primary pb-1">
                                            Download: {downloads[0].label}
                                        </span>
                                    </a>
                                </div>
                            )}

                            {/* Final CTA / Backup */}
                            <div className="pt-8 flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                    <span>Email Sent To:</span>
                                    <span className="text-white/40">{session.customer_details?.email}</span>
                                </div>
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 font-mono text-[10px] text-white/40 hover:text-primary uppercase tracking-[0.3em] transition-colors w-fit group"
                                >
                                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
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
