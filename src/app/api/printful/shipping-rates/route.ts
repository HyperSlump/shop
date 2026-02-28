import { NextResponse } from 'next/server';
import { printfulService } from '@/lib/services/printfulService';

const QUOTE_CACHE_TTL_MS = 2 * 60 * 1000;

type CachedQuote = {
    expiresAt: number;
    value: {
        rates: unknown[];
        tax: number;
    };
};

const quoteCache = new Map<string, CachedQuote>();

function getQuoteCacheKey(recipient: any, physicalItems: any[]) {
    const normalizedRecipient = {
        address1: String(recipient?.address1 || '').trim().toLowerCase(),
        city: String(recipient?.city || '').trim().toLowerCase(),
        state_code: String(recipient?.state_code || '').trim().toUpperCase(),
        country_code: String(recipient?.country_code || '').trim().toUpperCase(),
        zip: String(recipient?.zip || '').trim().toUpperCase(),
    };

    const normalizedItems = physicalItems
        .map((item) => ({
            quantity: item.quantity,
            retail_price: item.retail_price,
            amount: item.amount,
            catalog_variant_id: item.catalog_variant_id ?? null,
            sync_variant_id: item.sync_variant_id ?? null,
        }))
        .sort((a, b) => {
            const aId = String(a.sync_variant_id ?? a.catalog_variant_id ?? '');
            const bId = String(b.sync_variant_id ?? b.catalog_variant_id ?? '');
            return aId.localeCompare(bId);
        });

    return JSON.stringify({ recipient: normalizedRecipient, items: normalizedItems });
}

function getCachedQuote(cacheKey: string) {
    const cached = quoteCache.get(cacheKey);
    if (!cached) return null;

    if (cached.expiresAt <= Date.now()) {
        quoteCache.delete(cacheKey);
        return null;
    }

    return cached.value;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { recipient, items } = body;

        if (!recipient || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing recipient or items' }, { status: 400 });
        }

        const resolveVariantIds = (item: any) => {
            const toNumber = (value: unknown) => {
                if (value === undefined || value === null) return undefined;
                const parsed = parseInt(String(value), 10);
                return Number.isNaN(parsed) ? undefined : parsed;
            };

            const catalogCandidates = [
                item.metadata?.catalog_variant_id,
                item.selectedCatalogVariantId,
                item.variants?.find((v: any) => String(v.id) === String(item.selectedVariantId))?.catalog_variant_id,
                item.variants?.[0]?.catalog_variant_id
            ]
                .map(toNumber)
                .filter((value) => value !== undefined) as number[];

            const syncCandidates = [
                item.metadata?.variant_id,
                item.selectedVariantId,
                item.variants?.[0]?.id
            ]
                .map(toNumber)
                .filter((value) => value !== undefined) as number[];

            return {
                parsedCatalog: catalogCandidates[0],
                parsedSync: syncCandidates[0]
            };
        };

        const physicalItems = items
            .filter((item: any) => item.metadata?.type === 'PHYSICAL')
            .map((item: any) => {
                const parsedQty = Number(item.quantity ?? 1);
                const qty = Number.isFinite(parsedQty) ? Math.max(0, Math.min(10, Math.floor(parsedQty))) : 1;
                if (qty <= 0) {
                    return null;
                }
                const price = item.amount?.toString() || "0.00";
                const { parsedCatalog, parsedSync } = resolveVariantIds(item);

                if (parsedSync === undefined && parsedCatalog === undefined) {
                    console.warn('>>> [SHIPPING_API] Unable to resolve Printful variant for item:', item.name);
                    return null;
                }

                return {
                    quantity: qty,
                    retail_price: price,
                    amount: price,
                    catalog_variant_id: parsedCatalog,
                    sync_variant_id: parsedSync,
                };
            })
            .filter((item: any) => item);

        if (physicalItems.length === 0) {
            return NextResponse.json({ rates: [], tax: 0 });
        }

        const cacheKey = getQuoteCacheKey(recipient, physicalItems);
        const cachedQuote = getCachedQuote(cacheKey);
        if (cachedQuote) {
            return NextResponse.json(cachedQuote);
        }

        const shippingItems = physicalItems.map((item: any) => ({
            quantity: item.quantity,
            variant_id: item.catalog_variant_id ?? item.sync_variant_id,
        }));

        const costItems = physicalItems.map((item: any) => ({
            quantity: item.quantity,
            retail_price: item.retail_price,
            amount: item.amount,
            ...(item.sync_variant_id !== undefined
                ? { sync_variant_id: item.sync_variant_id }
                : { variant_id: item.catalog_variant_id }),
        }));

        const [shippingResult, costResult] = await Promise.allSettled([
            printfulService.estimateShipping(recipient, shippingItems),
            printfulService.estimateCosts(recipient, costItems),
        ]);

        if (shippingResult.status === 'rejected' && costResult.status === 'rejected') {
            throw new Error('Printful shipping and tax estimation failed');
        }

        const rates = shippingResult.status === 'fulfilled'
            ? shippingResult.value || []
            : [];

        const estimateCosts = costResult.status === 'fulfilled'
            ? costResult.value
            : { costs: { tax: '0', vat: '0' } };

        const taxAmount = (
            parseFloat(String(estimateCosts.costs?.tax || '0')) +
            parseFloat(String(estimateCosts.costs?.vat || '0'))
        );

        const responsePayload = {
            rates,
            tax: taxAmount
        };

        if (rates.length > 0) {
            quoteCache.set(cacheKey, {
                value: responsePayload,
                expiresAt: Date.now() + QUOTE_CACHE_TTL_MS,
            });
        }

        return NextResponse.json(responsePayload);
    } catch (error: any) {
        console.error('>>> [SHIPPING_API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
