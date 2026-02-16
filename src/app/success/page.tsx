import Link from 'next/link';
import { stripe } from '@/lib/stripe/server';
import { ArrowLeft } from 'lucide-react';

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id: string }>;
}) {
    const { session_id: sessionId } = await searchParams;

    if (!sessionId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-black dark:text-white font-mono">
                <div className="border border-red-500 p-8">
                    <h1 className="text-2xl font-bold mb-4">ERROR: NO SESSION ID</h1>
                    <Link href="/" className="underline hover:text-primary">RETURN TO BASE</Link>
                </div>
            </div>
        );
    }

    // Verify session
    let session;
    try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-black dark:text-white font-mono">
                <div className="border border-red-500 p-8">
                    <h1 className="text-2xl font-bold mb-4">ERROR: INVALID SESSION</h1>
                    <Link href="/" className="underline hover:text-primary">RETURN TO BASE</Link>
                </div>
            </div>
        );
    }

    // Map price IDs to file URLs
    const PRODUCT_FILES: Record<string, string> = {
        'price_1T070gHlah70mYw2Oe7IA8q8': 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip',
        'price_1T077bHlah70mYw2Oa6IwZgB': 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip',
        'price_1T076PHlah70mYw2D01WCvIT': 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip',
        'price_1Szmy3Hlah70mYw2t6BkUO6O': 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip',
    };

    const priceId = session.metadata?.priceId;
    const downloadUrl = (priceId && PRODUCT_FILES[priceId])
        ? PRODUCT_FILES[priceId]
        : "https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/sample_product_1.zip"; // Fallback to sample

    return (
        <div className="flex-1 w-full px-4 md:px-7 lg:px-8 py-10 animate-fade-in min-h-[60vh] flex flex-col">
            <div className="w-full space-y-10 flex-1 flex flex-col">
                {/* 1. Standard Header Frame */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-8 gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 text-primary/60 font-mono text-[10px] tracking-[0.3em]">
                            <span className="w-2 h-2 bg-green-500 animate-pulse" />
                            SYS_LOC // TRANSACTION_SUCCESS
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-gothic tracking-tighter leading-none lowercase">
                            transmission received
                        </h1>
                    </div>
                    <div className="flex flex-col items-start md:items-end font-mono text-[11px] opacity-40">
                        <p className="text-green-500 opacity-60 uppercase mb-1">STATUS: CONFIRMED</p>
                        <p>ORDER_ID: {session.id.slice(-12).toUpperCase()}</p>
                    </div>
                </div>

                {/* 2. Success Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <p className="font-mono text-sm md:text-lg leading-relaxed opacity-90 max-w-prose">
                                The digital assets have been unlocked. A secure downlink frequency has been established for your coordinates.
                                A backup transmission has also been routed to <span className="text-primary">{session.customer_details?.email}</span>.
                            </p>
                        </div>

                        {/* Download Console */}
                        <div className="p-8 border border-primary/20 bg-primary/[0.02] space-y-6 relative overflow-hidden group">
                            <div className="flex justify-between items-center text-[10px] font-mono opacity-50 uppercase tracking-widest">
                                <span>Signal_Integrity</span>
                                <span>[||||||||||||||||] 100%</span>
                            </div>

                            <a
                                href={downloadUrl}
                                className="block w-full bg-primary text-black font-mono font-bold uppercase py-5 text-center tracking-[0.3em] hover:bg-transparent hover:text-primary border-2 border-primary transition-all duration-300"
                            >
                                INITIATE_DOWNLOAD
                            </a>

                            <div className="text-[10px] font-mono opacity-40 italic leading-relaxed pt-2">
                                &gt; Warning: Download links expire after 24 hours of inactivity.
                                Ensure local storage capacity is verified.
                            </div>
                            <div className="absolute top-0 right-0 p-2 font-mono text-[8px] opacity-10 uppercase tracking-widest">Vault.access</div>
                        </div>

                        <Link href="/" className="inline-flex items-center gap-2 text-primary/70 hover:text-primary transition-all group w-fit">
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-mono text-[12px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">back</span>
                        </Link>
                    </div>

                    {/* Visual Confirmation */}
                    <div className="relative aspect-square md:aspect-auto border border-primary/10 overflow-hidden group bg-foreground/5 dark:bg-white/5 min-h-[400px]">
                        <div className="absolute inset-0 bg-primary/5" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <span className="material-icons text-[160px] text-primary opacity-20 grayscale group-hover:grayscale-0 transition-all duration-1000">task_alt</span>
                                <span className="font-mono text-[10px] tracking-[0.5em] opacity-30 uppercase animate-pulse">DECRYPTING_ASSETS...</span>
                            </div>
                        </div>
                        {/* Scanning Line Animation */}
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] animate-scan" />
                    </div>
                </div>
            </div>

        </div>
    );
}
