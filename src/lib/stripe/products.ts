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
                description: 'Industrial atmosphere and corrupted noise floors. High-fidelity textures for cinematic sound design.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 15.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    sample_1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                    sample_2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                    format: 'WAV',
                    size: '1.2GB'
                }
            },
            {
                id: 'price_mock_2',
                productId: 'prod_mock_2',
                name: 'BROKEN_DRUMS_X',
                description: 'Distorted percussion and rhythmic glitches. Hard-hitting kicks and snares for industrial techno.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 25.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                    format: 'WAV',
                    size: '850MB'
                }
            },
            {
                id: 'price_mock_3',
                productId: 'prod_mock_3',
                name: 'NEURO_BASS_V2',
                description: 'Reese basslines and twisted low-end frequencies. Essential for drum and bass and neurofunk.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 20.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
                    format: 'WAV',
                    size: '1.5GB'
                }
            },
            {
                id: 'price_mock_4',
                productId: 'prod_mock_4',
                name: 'CORTEX_LOOPS',
                description: 'Brain-melting synth loops and arpeggios. Modular synthesis recordings for IDM.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 18.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
                    format: 'WAV',
                    size: '900MB'
                }
            },
            {
                id: 'price_mock_5',
                productId: 'prod_mock_5',
                name: 'GLITCH_ARTIFACTS',
                description: 'Digital errors, datamosh sounds, and signal interference. Textures for modern glitch art.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 12.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
                    format: 'WAV',
                    size: '500MB'
                }
            },
            {
                id: 'price_mock_6',
                productId: 'prod_mock_6',
                name: 'ACID_WASH_303',
                description: 'Squelchy TB-303 acid lines. Recorded through analog distortion pedals.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 22.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
                    format: 'WAV',
                    size: '1.1GB'
                }
            },
            {
                id: 'price_mock_7',
                productId: 'prod_mock_7',
                name: 'DISTORTION_UNIT',
                description: 'Heavy distortion FX chains and impulse responses. Add grit to any sound source.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 15.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
                    format: 'WAV',
                    size: '600MB'
                }
            },
            {
                id: 'price_mock_8',
                productId: 'prod_mock_8',
                name: 'VOCAL_CHOP_SYSTEM',
                description: 'Processed vocal chops and granular synthesis textures. Futuristic vocal aesthetic.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 28.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
                    format: 'WAV',
                    size: '1.8GB'
                }
            },
            {
                id: 'price_mock_9',
                productId: 'prod_mock_9',
                name: 'AMBIENT_WASH_IV',
                description: 'Lush, evolving ambient pads and drones. Perfect for background textures and intros.',
                image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500',
                currency: 'usd',
                amount: 19.00,
                metadata: {
                    audio_preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
                    format: 'WAV',
                    size: '2.0GB'
                }
            }
        ]
    }
}

export async function getProductById(id: string) {
    const products = await getActiveProducts();
    // Support lookup by Stripe Price ID (e.g. price_...) or Product ID (e.g. prod_...)
    return products.find(p => p.id === id || p.productId === id);
}
