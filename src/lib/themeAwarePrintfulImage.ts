type VariantLike = {
    name: string;
    image?: string | null;
};

type ProductLike = {
    metadata?: Record<string, string> | null;
    image?: string | null;
    variants?: VariantLike[] | null;
};

const LIGHT_VARIANT_KEYWORDS = [
    'white',
    'light',
    'ash',
    'heather',
    'silver',
    'graphite',
    'sand',
    'bone',
    'cream',
    'beige',
];

const DARK_VARIANT_KEYWORDS = [
    'black',
    'dark',
    'charcoal',
    'midnight',
    'navy',
];

function hasKeyword(name: string, keywords: string[]) {
    const lower = name.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword));
}

export function getThemePreferredPrintfulVariant<T extends VariantLike>(
    variants: T[] | undefined | null,
    isDark: boolean
): T | null {
    if (!variants?.length) return null;

    if (isDark) {
        const lightMatch = variants.find((variant) => variant.image && hasKeyword(variant.name, LIGHT_VARIANT_KEYWORDS));
        if (lightMatch) return lightMatch;

        const nonDark = variants.find((variant) => variant.image && !hasKeyword(variant.name, DARK_VARIANT_KEYWORDS));
        if (nonDark) return nonDark;
    } else {
        const darkMatch = variants.find((variant) => variant.image && hasKeyword(variant.name, DARK_VARIANT_KEYWORDS));
        if (darkMatch) return darkMatch;
    }

    return variants.find((variant) => Boolean(variant.image)) || null;
}

export function getThemeAwareProductImage(product: ProductLike, isDark: boolean) {
    if (product.metadata?.type !== 'PHYSICAL') {
        return product.image || null;
    }

    const preferredVariant = getThemePreferredPrintfulVariant(product.variants, isDark);
    return preferredVariant?.image || product.image || null;
}
