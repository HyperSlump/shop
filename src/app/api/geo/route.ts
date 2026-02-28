import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // Vercel provides these headers in production
    const country = req.headers.get('x-vercel-ip-country') || 'US';
    const region = req.headers.get('x-vercel-ip-country-region') || '';

    // For local development, we'll return a default or use a dummy check
    // You can also use third-party geo-IP services here if needed for deeper local testing

    return NextResponse.json({
        country,
        region,
        isEstimate: true
    });
}
