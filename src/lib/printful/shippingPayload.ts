export type ShippingItemInput = {
    id: string;
    name?: string;
    amount: number;
    quantity?: number;
    metadata?: Record<string, string>;
    selectedVariantId?: string;
    selectedCatalogVariantId?: string;
};

export type ShippingItemPayload = {
    id: string;
    name?: string;
    amount: number;
    quantity: number;
    metadata: { type?: string };
    catalog_variant_id?: string;
    sync_variant_id?: string;
};

export function buildPrintfulShippingItems(items: ShippingItemInput[]): ShippingItemPayload[] {
    return (items || [])
        .filter((item) => item?.metadata?.type === 'PHYSICAL')
        .map((item) => {
            const parsedQty = Number(item.quantity ?? 1);
            const quantity = Number.isFinite(parsedQty)
                ? Math.max(0, Math.min(10, Math.floor(parsedQty)))
                : 1;
            const parsedAmount = Number(item.amount ?? 0);
            const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
            const catalogVariantId = item.metadata?.catalog_variant_id || item.selectedCatalogVariantId || undefined;
            const syncVariantId = item.metadata?.variant_id || item.selectedVariantId || undefined;

            return {
                id: item.id,
                name: item.name,
                amount,
                quantity,
                metadata: { type: item.metadata?.type },
                catalog_variant_id: catalogVariantId,
                sync_variant_id: syncVariantId,
            };
        })
        .filter((item) => item.quantity > 0);
}
