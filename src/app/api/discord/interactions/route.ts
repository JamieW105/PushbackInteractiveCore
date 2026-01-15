import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('[DISCORD] ===== NEW REQUEST =====');
        console.log('[DISCORD] Method:', request.method);
        console.log('[DISCORD] URL:', request.url);

        const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

        if (!PUBLIC_KEY) {
            console.error('[DISCORD] DISCORD_PUBLIC_KEY is not set!');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        console.log('[DISCORD] PUBLIC_KEY exists');

        const body = await request.text();
        console.log('[DISCORD] Body received, length:', body.length);
        console.log('[DISCORD] Body content:', body.substring(0, 200));

        let interaction;
        try {
            interaction = JSON.parse(body);
        } catch (e: any) {
            console.error('[DISCORD] JSON parse error:', e.message);
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        console.log('[DISCORD] Interaction type:', interaction.type);
        console.log('[DISCORD] Full interaction:', JSON.stringify(interaction));

        // Type 1 = PING
        if (interaction.type === 1) {
            console.log('[DISCORD] ✅ Responding to PING');
            return NextResponse.json({ type: 1 });
        }

        // Type 2 = Application Command
        if (interaction.type === 2) {
            console.log('[DISCORD] Received command:', interaction.data?.name);
            return NextResponse.json({
                type: 4,
                data: { content: 'Command received! Bot is being configured...' }
            });
        }

        console.log('[DISCORD] Unknown interaction type');
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });

    } catch (error: any) {
        console.error('[DISCORD] ❌ ERROR:', error.message);
        console.error('[DISCORD] Stack:', error.stack);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'Discord webhook endpoint is running',
        configured: !!process.env.DISCORD_PUBLIC_KEY,
        timestamp: new Date().toISOString()
    });
}
