import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

        // Check if PUBLIC_KEY is configured
        if (!PUBLIC_KEY) {
            console.error('[DISCORD] DISCORD_PUBLIC_KEY is not set!');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const body = await request.text();
        const interaction = JSON.parse(body);

        console.log('[DISCORD] Interaction type:', interaction.type);

        // Discord sends a PING (type 1) to verify the endpoint
        if (interaction.type === 1) {
            console.log('[DISCORD] Responding to PING');
            return NextResponse.json({ type: 1 });
        }

        // For now, just acknowledge other interactions
        return NextResponse.json({
            type: 4,
            data: { content: 'Bot is being configured...' }
        });

    } catch (error: any) {
        console.error('[DISCORD] Error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}

// Add GET handler for testing
export async function GET() {
    return NextResponse.json({
        status: 'Discord webhook endpoint is running',
        configured: !!process.env.DISCORD_PUBLIC_KEY,
        timestamp: new Date().toISOString()
    });
}
