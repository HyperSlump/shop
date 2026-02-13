import { stripe } from './server'
import Stripe from 'stripe'

export async function getActiveProducts() {
    try {
        const prices = await stripe.prices.list({
            active: true,
            expand: ['data.product'],
            limit: 100,
        })

        const products = prices.data
            .filter(price => (price.product as Stripe.Product).active)
            .map((price) => {
                const product = price.product as Stripe.Product
                return {
                    id: price.id,
                    productId: product.id,
                    name: product.name,
                    description: product.description,
                    image: product.images?.[0] || '',
                    currency: price.currency,
                    amount: price.unit_amount ? price.unit_amount / 100 : 0,
                    metadata: product.metadata,
                }
            })

        return products
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}
