"use server"

import { createClient } from "@/utils/supabase/server"

export async function getRobloxPlayerInfo(username: string) {
    try {
        // 1. Get ID from Username (using exact lookup for better reliability)
        const searchRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
        });

        if (!searchRes.ok) {
            const errorText = await searchRes.text();
            throw new Error(`Roblox API Error (${searchRes.status}): ${errorText}`);
        }

        const searchData = await searchRes.json();

        if (!searchData.data || searchData.data.length === 0) {
            return { success: false, error: 'User not found' };
        }

        const user = searchData.data[0];
        const userId = user.id;

        // 2. Get full details (description)
        const detailRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
        const details = await detailRes.json();

        // 3. Get Thumbnail
        const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        const thumbData = await thumbRes.json();
        const avatarUrl = thumbData.data?.[0]?.imageUrl;

        // 4. Get Presence
        const presenceRes = await fetch(`https://presence.roblox.com/v1/presence/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIds: [userId] })
        });
        const presenceData = await presenceRes.json();
        const presence = presenceData.userPresences?.[0];

        // Check if in our specific game
        const universeId = process.env.ROBLOX_UNIVERSE_ID;
        const isInThisGame = presence?.universeId?.toString() === universeId;

        return {
            success: true,
            player: {
                userId: userId,
                username: user.name,
                displayName: user.displayName,
                description: details.description || "No description provided.",
                avatarUrl: avatarUrl,
                status: presence?.userPresenceType === 2 ? 'In-Game' :
                    presence?.userPresenceType === 1 ? 'Online' : 'Offline',
                lastLocation: presence?.lastLocation || 'Unknown',
                isInThisGame: isInThisGame
            }
        };
    } catch (err: any) {
        console.error("Player Lookup Error:", err);
        return { success: false, error: "Failed to fetch player data." };
    }
}

import { sendRobloxMessageInternal } from "@/lib/roblox-internal"

export async function sendRobloxMessage(
    targetInput: string, // User ID or Username
    actionType: string,
    messageData: object
) {
    const supabase = await createClient()

    // 1. Auth Check (Keep this for the Server Action)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    return await sendRobloxMessageInternal(targetInput, actionType, messageData, user.email || 'Unknown', user.id)
}
