
"use server"

import { getQotdBot } from "@/lib/bot"
import { createClient } from "@/utils/supabase/server"
import { EmbedBuilder, TextChannel, Message } from "discord.js"

export interface QotdPayload {
    question: string
    title: string
    mode: 'reaction' | 'thread'
    options: { label: string, emoji: string }[]
    pings: { type: 'user' | 'role', id: string, name: string }[]
    channelId: string
}

export async function sendQotd(data: QotdPayload) {
    const supabase = await createClient()

    // 1. Validate Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!data.channelId) {
        return { success: false, error: 'Channel ID is missing' }
    }

    // 2. Get Bot
    const bot = await getQotdBot()
    if (!bot || !bot.isReady()) {
        return { success: false, error: 'Bot is not connected. Check logs.' }
    }

    try {
        // 3. Fetch Channel
        const channel = await bot.channels.fetch(data.channelId) as TextChannel
        if (!channel || !channel.isTextBased()) {
            return { success: false, error: 'Invalid Channel ID or channel type.' }
        }

        // 4. Construct Content (Pings)
        let content = ''
        if (data.pings.length > 0) {
            content = data.pings.map(p => p.type === 'role' ? `<@&${p.id}>` : `<@${p.id}>`).join(' ')
        }

        // 5. Construct Embed
        const embed = new EmbedBuilder()
            .setColor('#5865F2') // Blurple
            .setAuthor({ name: 'Question of the Day', iconURL: bot.user?.displayAvatarURL() })
            .setTitle(data.title || 'Community Question')
            .setDescription(data.question)
            .setTimestamp()
            .setFooter({ text: `Posted by ${user.email?.split('@')[0] || 'Staff'}` })

        if (data.mode === 'reaction' && data.options.length > 0) {
            const optionsText = data.options.map(opt => `${opt.emoji} **${opt.label}**`).join('\n')
            embed.addFields({ name: 'Options', value: optionsText })
        }

        // 6. Send Message
        const message = await channel.send({
            content: content || undefined,
            embeds: [embed]
        })

        // 7. Post-Processing (Reactions/Threads)
        if (data.mode === 'reaction' && data.options.length > 0) {
            for (const opt of data.options) {
                if (opt.emoji) {
                    try {
                        await message.react(opt.emoji)
                    } catch (e) {
                        console.error(`Failed to react with ${opt.emoji}`, e)
                    }
                }
            }
        } else if (data.mode === 'thread') {
            await message.startThread({
                name: data.title || data.question.slice(0, 50),
                autoArchiveDuration: 1440, // 24h
            })
        }

        // 8. Save to DB
        await supabase.from('qotd_posts').insert({
            question: data.question,
            title: data.title,
            mode: data.mode,
            options: data.options, // Ensure JSONB compatibility
            pings: data.pings,
            author_id: user.id,
            status: 'posted',
            // discord_message_id: message.id // If we had a column for it
        })

        return { success: true, messageId: message.id }

    } catch (error: any) {
        console.error('Failed to send QOTD:', error)
        return { success: false, error: error.message || 'Unknown error occurred' }
    }
}
