import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
    console.error('CRITICAL: STRIPE_SECRET_KEY is missing from environment variables.');
}

export const stripe = new Stripe(secretKey || '', {
    apiVersion: '2023-10-16' as any, // Stable version
    typescript: true,
});
