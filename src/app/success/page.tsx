import Link from 'next/link';
import { stripe } from '@/lib/stripe/server';

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-black dark:text-white font-mono p-4">
            <div className="max-w-xl w-full border border-black dark:border-white p-8 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-black dark:bg-white"></div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-black dark:bg-white"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-black dark:bg-white"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-black dark:bg-white"></div>

                <div className="text-center space-y-6">
                    <h1 className="font-display text-6xl text-primary">TRANSMISSON RECEIVED</h1>

                    <div className="space-y-2 border-y border-dashed border-black/20 dark:border-white/20 py-6">
                        <p className="text-sm opacity-60">ORDER_ID: {session.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm opacity-60">STATUS: <span className="text-green-500">CONFIRMED</span></p>
                        <p className="text-sm opacity-60">EMAIL: {session.customer_details?.email}</p>
                    </div>

                    <p>
                        The digital assets have been unlocked. A backup link has been sent to your email frequency.
                    </p>

                    <a
                        href={downloadUrl}
                        className="block w-full bg-primary text-black font-bold uppercase py-4 hover:scale-105 transition-transform"
                    >
                        INITIATE DOWNLOAD
                    </a>

                    <div className="pt-8">
                        <Link href="/" className="text-xs decoration-dashed underline hover:text-primary">
                            &lt; RETURN TO CATALOG
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
