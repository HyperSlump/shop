export type ProductFile = {
    url: string;
    label: string;
};

export const PRODUCT_FILES: Record<string, ProductFile> = {
    'price_1T070gHlah70mYw2Oe7IA8q8': {
        label: 'HYPERSLUMP_01',
        url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip'
    },
    'price_1T077bHlah70mYw2Oa6IwZgB': {
        label: 'HYPERSLUMP_02',
        url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip'
    },
    'price_1T076PHlah70mYw2D01WCvIT': {
        label: 'HYPERSLUMP_03',
        url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip'
    },
    'price_1Szmy3Hlah70mYw2t6BkUO6O': {
        label: 'HYPERSLUMP_04',
        url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip'
    },
};

export const FALLBACK_FILE_URL = 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/sample_product_1.zip';
export const FALLBACK_FILE_LABEL = 'DOWNLOAD_ASSET';

export function getProductFile(priceId?: string): ProductFile {
    if (!priceId || !PRODUCT_FILES[priceId]) {
        return {
            url: FALLBACK_FILE_URL,
            label: FALLBACK_FILE_LABEL
        };
    }
    return PRODUCT_FILES[priceId];
}
