
import { Client, REST, Routes, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { sendRobloxMessageInternal } from './roblox-internal';
import { getRobloxPlayerInfo } from '@/app/admin/roblox/actions';

// --- Command Definitions ---
export const commands = [
    new SlashCommandBuilder()
        .setName('roblox')
        .setDescription('Manage Roblox Servers and Players')
        .addSubcommand(sub =>
            sub.setName('lookup')
                .setDescription('Get info about a Roblox player')
                .addStringOption(opt => opt.setName('username').setDescription('Roblox Username').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('kick')
                .setDescription('Kick a player from the game')
                .addStringOption(opt => opt.setName('target').setDescription('Username or UserID').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason for kick').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('warn')
                .setDescription('Warn a player in game')
                .addStringOption(opt => opt.setName('target').setDescription('Username or UserID').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('message')
                .setDescription('Send a message to a player')
                .addStringOption(opt => opt.setName('target').setDescription('Username or UserID').setRequired(true))
                .addStringOption(opt => opt.setName('message').setDescription('Message content').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('shutdown')
                .setDescription('Shutdown a specific server')
                .addStringOption(opt => opt.setName('jobid').setDescription('Server Job ID').setRequired(true))
        ),

    new SlashCommandBuilder()
        .setName('update')
        .setDescription('Deploy a game update (Soft Shutdown)')
        .addBooleanOption(opt => opt.setName('confirm').setDescription('Confirm deployment').setRequired(true))
];

export async function registerMgmtCommands(token: string, clientId: string, guildId?: string) {
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        console.log('[BOT] Refreshing MGMT (/) commands.');
        // If guildId is provided, register for guild (faster dev), else global
        if (guildId) {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        } else {
            await rest.put(Routes.applicationCommands(clientId), { body: commands });
        }
        console.log('[BOT] Successfully registered MGMT (/) commands.');
    } catch (error) {
        console.error('[BOT] Error registering MGMT commands:', error);
    }
}

export async function handleMgmtInteraction(interaction: ChatInputCommandInteraction) {
    if (interaction.commandName === 'roblox') {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getString('target') || '';

        await interaction.deferReply();

        if (sub === 'lookup') {
            const username = interaction.options.getString('username', true);
            const res = await getRobloxPlayerInfo(username);
            if (res.success && res.player) {
                await interaction.editReply({
                    content: `**Roblox Player Lookup**\nUser: ${res.player.username} (${res.player.userId})\nStatus: ${res.player.status}\nLocation: ${res.player.lastLocation}`
                })
            } else {
                await interaction.editReply({ content: `Error: ${res.error}` });
            }
        }
        else if (sub === 'kick') {
            const reason = interaction.options.getString('reason', true);
            const res = await sendRobloxMessageInternal(target, 'kick', { reason }, `Discord User: ${interaction.user.tag}`);
            await interaction.editReply({ content: res.success ? `✅ Kick command sent for ${target}.` : `❌ Error: ${res.error}` });
        }
        else if (sub === 'warn') {
            const reason = interaction.options.getString('reason', true);
            const res = await sendRobloxMessageInternal(target, 'warn', { reason }, `Discord User: ${interaction.user.tag}`);
            await interaction.editReply({ content: res.success ? `✅ Warn command sent for ${target}.` : `❌ Error: ${res.error}` });
        }
        else if (sub === 'message') {
            const msg = interaction.options.getString('message', true);
            const res = await sendRobloxMessageInternal(target, 'message', { reason: msg }, `Discord User: ${interaction.user.tag}`);
            await interaction.editReply({ content: res.success ? `✅ Message sent to ${target}.` : `❌ Error: ${res.error}` });
        }
        else if (sub === 'shutdown') {
            const jobId = interaction.options.getString('jobid', true);
            const res = await sendRobloxMessageInternal(jobId, 'shutdown_server', { reason: 'Cmd from Discord' }, `Discord User: ${interaction.user.tag}`);
            await interaction.editReply({ content: res.success ? `✅ Shutdown command sent for server ${jobId}.` : `❌ Error: ${res.error}` });
        }
    }

    else if (interaction.commandName === 'update') { // Matching the registered name
        const confirm = interaction.options.getBoolean('confirm');
        if (!confirm) {
            await interaction.reply({ content: 'Update cancelled. You must set confirm to true.', ephemeral: true });
            return;
        }

        await interaction.deferReply();
        // Trigger Soft Shutdown
        // We reuse logic from src/app/admin/update/actions.ts but call internal helper
        // "ALL_SERVERS" is the key
        const res = await sendRobloxMessageInternal("ALL_SERVERS", 'soft_shutdown', { reason: 'Deploy from Discord' }, `Discord User: ${interaction.user.tag}`);

        await interaction.editReply({ content: res.success ? `🚀 **UPDATE DEPLOYED!**\nSoft shutdown signal sent to all servers.` : `❌ Error: ${res.error}` });
    }
}
