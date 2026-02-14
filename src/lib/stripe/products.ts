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
        console.error('Error fetching products from Stripe:', error)

        // Return mock products as a fallback so the site isn't empty
        return [
            {
                id: 'price_mock_1',
                productId: 'prod_mock_1',
                name: 'VOID_TEXTURES_01',
                description: 'Industrial atmosphere and corrupted noise floors.',
                image: 'https://via.placeholder.com/500/000000/FFFFFF?text=VOID_01',
                currency: 'usd',
                amount: 15.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    sample_1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                    sample_2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
                }
            },
            {
                id: 'price_mock_2',
                productId: 'prod_mock_2',
                name: 'BROKEN_DRUMS_X',
                description: 'Distorted percussion and rhythmic glitches.',
                image: 'https://via.placeholder.com/500/000000/FFFFFF?text=DRUMS_X',
                currency: 'usd',
                amount: 25.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                }
            }
        ]
    }
}
