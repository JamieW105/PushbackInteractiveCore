import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';
import { handleWebhookInteraction } from '@/lib/webhook-handler';

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY!;

export async function POST(request: NextRequest) {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();

    // Verify the request is from Discord
    const isValidRequest = verifyKey(body, signature!, timestamp!, PUBLIC_KEY);

    if (!isValidRequest) {
        return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 });
    }

    const interaction = JSON.parse(body);

    // Discord sends a PING to verify the endpoint
    if (interaction.type === 1) {
        return NextResponse.json({ type: 1 });
    }

    // Handle slash commands
    if (interaction.type === 2) {
        try {
            // Convert to discord.js-like interaction object
            const response = await handleWebhookInteraction(interaction);
            return NextResponse.json(response);
        } catch (error) {
            console.error('Interaction error:', error);
            return NextResponse.json({
                type: 4,
                data: {
                    content: '❌ An error occurred processing this command.',
                    flags: 64 // Ephemeral
                }
            });
        }
    }

    return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
}
