import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { apiKey, jobId, logs } = body

        if (apiKey !== ROBLOX_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!logs || !Array.isArray(logs) || logs.length === 0) {
            return NextResponse.json({ success: true }) // Nothing to do
        }

        const supabase = await createClient()

        // Prepare bulk insert
        const logEntries = logs.map((log: any) => ({
            server_id: jobId,
            message: log.message,
            msg_type: log.type,
            timestamp: new Date(log.timestamp * 1000).toISOString() // Roblox sends unix timestamp usually
        }))

        const { error } = await supabase
            .from('server_logs')
            .insert(logEntries)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Log Ingest Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
