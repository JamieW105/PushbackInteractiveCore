
"use server"

import { getMgmtBot } from "@/lib/bot"
import { createClient } from "@/utils/supabase/server"

export async function manageUser(
    action: 'kick' | 'ban' | 'timeout',
    targetId: string,
    reason: string = 'No reason provided',
    durationMinutes: number = 60 // only for timeout
) {
    const supabase = await createClient()

    // 1. Auth Check - Strict
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Check role from profile (safety double check beyond middleware)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['admin', 'moderator'].includes(profile?.role || '')) {
        return { success: false, error: 'Insufficient permissions' }
    }

    // 2. Get Bot
    const bot = await getMgmtBot()
    if (!bot || !bot.isReady()) {
        return { success: false, error: 'Management Bot is not connected. Check logs/Env.' }
    }

    // 3. Get Guild (From Settings)
    const { data: settings } = await supabase.from('bot_settings').select('value').eq('key', 'mgmt_guild_id').single()
    const guildId = settings?.value

    if (!guildId) {
        return { success: false, error: 'Management Guild ID not configured in settings.' }
    }

    try {
        const guild = await bot.guilds.fetch(guildId)
        if (!guild) return { success: false, error: 'Bot is not in the configured guild.' }

        // 4. Fetch Target Member
        const member = await guild.members.fetch(targetId).catch(() => null)
        if (!member && action !== 'ban') {
            // Ban can technically work with just ID, but kick/timeout need member object usually (or fetchable)
            if (action === 'kick' || action === 'timeout')
                return { success: false, error: 'User not found in this server.' }
        }

        // 5. Execute Action
        let logDetail = ''

        switch (action) {
            case 'kick':
                if (!member) throw new Error("Member not found")
                if (!member.kickable) return { success: false, error: 'Bot cannot kick this user (higher role?).' }
                await member.kick(reason)
                logDetail = `Kicked ${member.user.tag}`
                break;

            case 'ban':
                // Ban supports ID even if not in server
                await guild.members.ban(targetId, { reason })
                logDetail = `Banned User ID ${targetId}`
                break;

            case 'timeout':
                if (!member) throw new Error("Member not found")
                if (!member.moderatable) return { success: false, error: 'Bot cannot timeout this user.' }
                await member.timeout(durationMinutes * 60 * 1000, reason)
                logDetail = `Timed out ${member.user.tag} for ${durationMinutes}m`
                break;
        }

        // 6. Log to DB
        await supabase.from('bot_management_logs').insert({
            user_id: user.id,
            action: `discord_${action}`,
            details: { target: targetId, reason, detail: logDetail }
        })

        return { success: true, message: `${logDetail} successfully.` }

    } catch (error: any) {
        console.error(`Failed to ${action}:`, error)
        return { success: false, error: error.message || 'Unknown error occurred' }
    }
}
