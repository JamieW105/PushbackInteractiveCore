import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';
import { handleWebhookInteraction } from '@/lib/webhook-handler';

export async function POST(request: NextRequest) {
    try {
        const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

        // Check if PUBLIC_KEY is configured
        if (!PUBLIC_KEY) {
            console.error('[DISCORD] DISCORD_PUBLIC_KEY is not set!');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const signature = request.headers.get('x-signature-ed25519');
        const timestamp = request.headers.get('x-signature-timestamp');
        const body = await request.text();

        console.log('[DISCORD] Received interaction request');

        // Verify the request is from Discord
        const isValidRequest = verifyKey(body, signature!, timestamp!, PUBLIC_KEY);

        if (!isValidRequest) {
            console.error('[DISCORD] Invalid signature');
            return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 });
        }

        const interaction = JSON.parse(body);
        console.log('[DISCORD] Interaction type:', interaction.type);

        // Discord sends a PING to verify the endpoint
        if (interaction.type === 1) {
            console.log('[DISCORD] Responding to PING');
            return NextResponse.json({ type: 1 });
        }

        // Handle slash commands
        if (interaction.type === 2) {
            console.log('[DISCORD] Handling command:', interaction.data?.name);
            const response = await handleWebhookInteraction(interaction);
            return NextResponse.json(response);
        }

        return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
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
        configured: !!process.env.DISCORD_PUBLIC_KEY
    });
}
