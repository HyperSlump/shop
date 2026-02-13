import { stripe } from './server'
import Stripe from 'stripe'

export async function getActiveProducts() {
    const prices = await stripe.prices.list({
        active: true,
        expand: ['data.product'],
        limit: 100, // Increased from 10 to support more products
    })

    // Filter out any prices with products that aren't marked as active
    // Or just map them to a friendlier format
    const products = prices.data
        .filter(price => (price.product as Stripe.Product).active)
        .map((price) => {
            const product = price.product as Stripe.Product
            return {
                id: price.id, // We use the Price ID for checkout
                productId: product.id,
                name: product.name,
                description: product.description,
                image: product.images?.[0] || '',
                currency: price.currency,
                amount: price.unit_amount ? price.unit_amount / 100 : 0, // Convert to main currency unit
                metadata: product.metadata,
            }
        })

    products.forEach(p => console.log(`Product ${p.name} image:`, p.image));

    return products
}
