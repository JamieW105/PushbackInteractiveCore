"use server"

import { sendRobloxMessage } from "../roblox/actions"

export async function shutdownServer(serverId: string) {
    // We reuse sendRobloxMessage but target is JobId, action is 'shutdown_server'
    // Security checks are inside sendRobloxMessage (admin role required)

    // Note: MessagingService broadcasts to ALL servers. 
    // The Roblox script must check if 'serverId' matches its own JobId.

    return await sendRobloxMessage(serverId, 'shutdown_server', {
        reason: 'Remote Shutdown initiated via Admin Panel'
    })
}
