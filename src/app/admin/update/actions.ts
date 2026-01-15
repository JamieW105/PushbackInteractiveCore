"use server"

import { sendRobloxMessage } from "../roblox/actions"

export async function triggerSoftShutdown() {
    // Sends a 'soft_shutdown' command to ALL servers on the topic 'AdminActions'.
    // The Lua script will receive this and teleport players to a new instance.
    return await sendRobloxMessage("ALL_SERVERS", 'soft_shutdown', {
        reason: 'A new update has been deployed. Migrating servers...'
    })
}
