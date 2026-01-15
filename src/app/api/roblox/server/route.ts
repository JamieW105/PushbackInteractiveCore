import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { apiKey, jobId, status, region, placeVersion, fps, ping, playerCount, maxPlayers, joinLink } = body

        // 1. Validate API Key
        if (apiKey !== ROBLOX_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!jobId) {
            return NextResponse.json({ error: 'Missing JobId' }, { status: 400 })
        }

        const supabase = await createClient()

        // 2. Upsert Server Status
        const { error } = await supabase
            .from('game_servers')
            .upsert({
                id: jobId,
                status: status || 'active',
                region,
                place_version: placeVersion,
                fps,
                ping,
                player_count: playerCount,
                max_players: maxPlayers,
                join_link: joinLink,
                last_heartbeat: new Date().toISOString()
            })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Heartbeat Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json()
        const { apiKey, jobId } = body

        if (apiKey !== ROBLOX_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Mark as shutdown or delete? User said "server should disappear from the list".
        // Use delete for now to make it disappear, or update status 'shutdown' and filter on frontend.
        // User said "disappear from the list".

        const { error } = await supabase
            .from('game_servers')
            .delete()
            .eq('id', jobId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
