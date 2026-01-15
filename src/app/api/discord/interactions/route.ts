import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        console.log('[DISCORD] ===== NEW REQUEST =====');

        const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

        if (!PUBLIC_KEY) {
            console.error('[DISCORD] DISCORD_PUBLIC_KEY is not set!');
            return new NextResponse(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const body = await request.text();
        console.log('[DISCORD] Body length:', body.length);

        let interaction;
        try {
            interaction = JSON.parse(body);
        } catch (e: any) {
            console.error('[DISCORD] JSON parse error:', e.message);
            return new NextResponse(
                JSON.stringify({ error: 'Invalid JSON' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('[DISCORD] Interaction type:', interaction.type);

        // Type 1 = PING - Discord verification
        if (interaction.type === 1) {
            console.log('[DISCORD] ✅ Responding to PING');
            return new NextResponse(
                JSON.stringify({ type: 1 }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // Type 2 = Application Command
        if (interaction.type === 2) {
            console.log('[DISCORD] Received command:', interaction.data?.name);
            return new NextResponse(
                JSON.stringify({
                    type: 4,
                    data: { content: 'Command received!' }
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return new NextResponse(
            JSON.stringify({ error: 'Unknown type' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('[DISCORD] ❌ ERROR:', error.message);
        return new NextResponse(
            JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function GET() {
    return new NextResponse(
        JSON.stringify({
            status: 'Discord webhook endpoint is running',
            configured: !!process.env.DISCORD_PUBLIC_KEY,
            timestamp: new Date().toISOString()
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}
