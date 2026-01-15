import { sendRobloxMessageInternal } from './roblox-internal';
import { getRobloxPlayerInfo } from '@/app/admin/roblox/actions';

// Helper to get option value from Discord interaction
function getOption(options: any[], name: string): any {
    return options?.find((opt: any) => opt.name === name)?.value;
}

export async function handleWebhookInteraction(interaction: any) {
    const { data } = interaction;
    const commandName = data.name;

    // Get subcommand if exists
    const subcommand = data.options?.find((opt: any) => opt.type === 1);
    const options = subcommand?.options || data.options || [];

    if (commandName === 'roblox') {
        const sub = subcommand?.name;

        if (sub === 'lookup') {
            const username = getOption(options, 'username');
            const res = await getRobloxPlayerInfo(username);

            if (res.success && res.player) {
                return {
                    type: 4,
                    data: {
                        content: `**Roblox Player Lookup**\nUser: ${res.player.username} (${res.player.userId})\nStatus: ${res.player.status}\nLocation: ${res.player.lastLocation}`
                    }
                };
            } else {
                return {
                    type: 4,
                    data: { content: `Error: ${res.error}` }
                };
            }
        }

        else if (sub === 'kick') {
            const target = getOption(options, 'target');
            const reason = getOption(options, 'reason');
            const res = await sendRobloxMessageInternal(target, 'kick', { reason }, `Discord`);

            return {
                type: 4,
                data: {
                    content: res.success ? `✅ Kick command sent for ${target}.` : `❌ Error: ${res.error}`
                }
            };
        }

        else if (sub === 'warn') {
            const target = getOption(options, 'target');
            const reason = getOption(options, 'reason');
            const res = await sendRobloxMessageInternal(target, 'warn', { reason }, `Discord`);

            return {
                type: 4,
                data: {
                    content: res.success ? `✅ Warn command sent for ${target}.` : `❌ Error: ${res.error}`
                }
            };
        }

        else if (sub === 'message') {
            const target = getOption(options, 'target');
            const msg = getOption(options, 'message');
            const res = await sendRobloxMessageInternal(target, 'message', { reason: msg }, `Discord`);

            return {
                type: 4,
                data: {
                    content: res.success ? `✅ Message sent to ${target}.` : `❌ Error: ${res.error}`
                }
            };
        }

        else if (sub === 'shutdown') {
            const jobId = getOption(options, 'jobid');
            const res = await sendRobloxMessageInternal(jobId, 'shutdown_server', { reason: 'Cmd from Discord' }, `Discord`);

            return {
                type: 4,
                data: {
                    content: res.success ? `✅ Shutdown command sent for server ${jobId}.` : `❌ Error: ${res.error}`
                }
            };
        }
    }

    else if (commandName === 'update') {
        const confirm = getOption(options, 'confirm');

        if (!confirm) {
            return {
                type: 4,
                data: {
                    content: 'Update cancelled. You must set confirm to true.',
                    flags: 64 // Ephemeral
                }
            };
        }

        const res = await sendRobloxMessageInternal("ALL_SERVERS", 'soft_shutdown', { reason: 'Deploy from Discord' }, `Discord`);

        return {
            type: 4,
            data: {
                content: res.success ? `🚀 **UPDATE DEPLOYED!**\nSoft shutdown signal sent to all servers.` : `❌ Error: ${res.error}`
            }
        };
    }

    return {
        type: 4,
        data: { content: '❌ Unknown command' }
    };
}
