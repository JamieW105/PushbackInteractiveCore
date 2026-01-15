
import { Client, GatewayIntentBits } from 'discord.js';

// Global declaration for development hot-reloading
const globalForBot = global as unknown as {
    qotdClient: Client,
    mgmtClient: Client
};

export const getQotdBot = async () => {
    if (!process.env.DISCORD_BOT_TOKEN_QOTD) {
        console.warn('[BOT] Missing DISCORD_BOT_TOKEN_QOTD');
        return null;
    }

    if (globalForBot.qotdClient) return globalForBot.qotdClient;

    console.log('[BOT] Initializing QOTD Bot...');
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            // GatewayIntentBits.MessageContent, // Uncomment once enabled in dev portal
            GatewayIntentBits.GuildMessageReactions
        ]
    });

    try {
        await client.login(process.env.DISCORD_BOT_TOKEN_QOTD);
        globalForBot.qotdClient = client;
        return client;
    } catch (err) {
        console.error('[BOT] QOTD Login Failed:', err);
        return null;
    }
}

export const getMgmtBot = async () => {
    if (!process.env.DISCORD_BOT_TOKEN_MGMT) {
        console.warn('[BOT] Missing DISCORD_BOT_TOKEN_MGMT');
        return null;
    }

    if (globalForBot.mgmtClient) return globalForBot.mgmtClient;

    console.log('[BOT] Initializing Management Bot...');
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers, // Required for fetching members to kick/ban
            GatewayIntentBits.GuildModeration
        ]
    });

    try {
        await client.login(process.env.DISCORD_BOT_TOKEN_MGMT);
        globalForBot.mgmtClient = client;

        // Register slash commands and set up handler
        const { registerMgmtCommands, handleMgmtInteraction } = await import('./mgmt-commands');

        client.once('ready', async () => {
            console.log(`[BOT] Management Bot logged in as ${client.user?.tag}`);
            // Register commands (use guild ID for faster dev, or omit for global)
            // You can add DISCORD_GUILD_ID to .env for faster testing
            await registerMgmtCommands(
                process.env.DISCORD_BOT_TOKEN_MGMT!,
                client.user!.id,
                process.env.DISCORD_GUILD_ID // Optional
            );
        });

        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            await handleMgmtInteraction(interaction);
        });

        return client;
    } catch (err) {
        console.error('[BOT] Mgmt Login Failed:', err);
        return null;
    }
}
