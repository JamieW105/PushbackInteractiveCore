// Register Discord Slash Commands
// Run this locally: node register-commands.js

const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: 'roblox',
        description: 'Manage Roblox Servers and Players',
        options: [
            {
                type: 1, // SUB_COMMAND
                name: 'lookup',
                description: 'Get info about a Roblox player',
                options: [{
                    type: 3, // STRING
                    name: 'username',
                    description: 'Roblox Username',
                    required: true
                }]
            },
            {
                type: 1,
                name: 'kick',
                description: 'Kick a player from the game',
                options: [
                    { type: 3, name: 'target', description: 'Username or UserID', required: true },
                    { type: 3, name: 'reason', description: 'Reason for kick', required: true }
                ]
            },
            {
                type: 1,
                name: 'warn',
                description: 'Warn a player in game',
                options: [
                    { type: 3, name: 'target', description: 'Username or UserID', required: true },
                    { type: 3, name: 'reason', description: 'Reason', required: true }
                ]
            },
            {
                type: 1,
                name: 'message',
                description: 'Send a message to a player',
                options: [
                    { type: 3, name: 'target', description: 'Username or UserID', required: true },
                    { type: 3, name: 'message', description: 'Message content', required: true }
                ]
            },
            {
                type: 1,
                name: 'shutdown',
                description: 'Shutdown a specific server',
                options: [
                    { type: 3, name: 'jobid', description: 'Server Job ID', required: true }
                ]
            }
        ]
    },
    {
        name: 'update',
        description: 'Deploy a game update (Soft Shutdown)',
        options: [{
            type: 5, // BOOLEAN
            name: 'confirm',
            description: 'Confirm deployment',
            required: true
        }]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN_MGMT);

(async () => {
    try {
        console.log('🔄 Registering slash commands...');

        const clientId = process.env.DISCORD_CLIENT_ID;
        const guildId = process.env.DISCORD_GUILD_ID; // Optional: for faster dev

        if (guildId) {
            // Guild commands (instant)
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            console.log(`✅ Commands registered to guild ${guildId}`);
        } else {
            // Global commands (takes up to 1 hour)
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            console.log('✅ Commands registered globally (may take up to 1 hour)');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
