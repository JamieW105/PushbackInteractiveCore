import { createClient } from "@/utils/supabase/server"

export async function sendRobloxMessageInternal(
    targetInput: string,
    actionType: string,
    messageData: object,
    adminIdentifier: string, // Who performed the action (email or "Discord Bot")
    adminId?: string // Optional DB User ID if available, otherwise "system"
) {
    // 2. Env Config
    const apiKey = process.env.ROBLOX_OPEN_CLOUD_KEY
    const universeId = process.env.ROBLOX_UNIVERSE_ID

    if (!apiKey || !universeId) {
        return { success: false, error: 'Roblox API Key or Universe ID not configured.' }
    }

    try {
        const topic = "AdminActions"
        const url = `https://apis.roblox.com/messaging-service/v1/universes/${universeId}/topics/${topic}`

        const payload = {
            message: JSON.stringify({
                target: targetInput,
                action: actionType,
                data: messageData,
                admin: adminIdentifier
            })
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const err = await response.text()
            throw new Error(`Roblox API Error: ${response.status} ${err}`)
        }

        // 5. Log to DB (Try best effort)
        try {
            // If we don't have a valid user UUID for 'user_id', we might fail foreign key constraints 
            // unless we have a 'system' user or the column is nullable. 
            // For now, only log if we have a real user ID.
            if (adminId) {
                const supabase = await createClient()
                await supabase.from('bot_management_logs').insert({
                    user_id: adminId,
                    action: `roblox_${actionType}`,
                    details: { target: targetInput, data: messageData }
                })
            }
        } catch (dbErr) {
            console.warn("Failed to log Roblox action to DB:", dbErr)
        }

        return { success: true, message: 'Command sent to Roblox servers.' }

    } catch (error: any) {
        console.error('Roblox Action Failed:', error)
        return { success: false, error: error.message }
    }
}
