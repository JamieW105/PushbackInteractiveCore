"use client"

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Server, Activity, Power, Terminal, X, Minimize2, Loader2, Play } from 'lucide-react'
import { toast } from 'sonner'
import { shutdownServer } from '@/app/admin/developers/actions'

interface GameServer {
    id: string
    status: string
    region: string
    place_version: string
    fps: number
    ping: number
    player_count: number
    max_players: number
    last_heartbeat: string
    started_at: string
    join_link?: string
}

interface LogEntry {
    id: number
    timestamp: string
    message: string
    msg_type: string
}

export function ServerList() {
    const [servers, setServers] = useState<GameServer[]>([])
    const [selectedServer, setSelectedServer] = useState<GameServer | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // 1. Fetch Servers (Polling)
    useEffect(() => {
        const fetchServers = async () => {
            const { data } = await supabase
                .from('game_servers')
                .select('*')
                .order('id') // Order by ID or started_at

            if (data) setServers(data)
            setLoading(false)
        }

        fetchServers()
        const interval = setInterval(fetchServers, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleShutdown = async (serverId: string) => {
        if (!confirm('Are you sure you want to shut down this server? This will kick all players.')) return

        const res = await shutdownServer(serverId)
        if (res.success) {
            toast.success("Shutdown command sent")
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Server List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        Active Servers
                    </h3>
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                        {servers.length} Online
                    </span>
                </div>

                <div className="space-y-2">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading servers...</div>
                    ) : servers.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-lg">
                            No active servers found.
                        </div>
                    ) : (
                        servers.map(server => (
                            <div
                                key={server.id}
                                onClick={() => setSelectedServer(server)}
                                className={`glass-panel p-4 flex items-center justify-between cursor-pointer transition hover:border-white/20 ${selectedServer?.id === server.id ? 'border-pbi-blue/50 bg-pbi-blue/5' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${server.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        <Server className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                                            {server.id}
                                            {server.status !== 'active' && (
                                                <span className="text-[10px] bg-red-500 text-white px-1 rounded">SHUTDOWN</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 flex gap-3 mt-1">
                                            <span>v{server.place_version}</span>
                                            <span>{server.region}</span>
                                            <span>{server.player_count}/{server.max_players} Players</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-500 font-mono">
                                    <div>{server.fps.toFixed(1)} FPS</div>
                                    <div>{server.ping}ms</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Console Viewer */}
            {selectedServer ? (
                <ServerConsole server={selectedServer} onClose={() => setSelectedServer(null)} onShutdown={() => handleShutdown(selectedServer.id)} />
            ) : (
                <div className="hidden lg:flex items-center justify-center h-[400px] border border-dashed border-white/10 rounded-xl text-gray-500">
                    Select a server to view console
                </div>
            )}
        </div>
    )
}

function ServerConsole({ server, onClose, onShutdown }: { server: GameServer, onClose: () => void, onShutdown: () => void }) {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const bottomRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()
    const [tailing, setTailing] = useState(true)

    // Fetch logs
    useEffect(() => {
        setLogs([]) // clear on change

        const fetchInitialLogs = async () => {
            const { data } = await supabase
                .from('server_logs')
                .select('*')
                .eq('server_id', server.id)
                .order('timestamp', { ascending: true }) // Oldest first for display
                .limit(500) // limit initial load usually, but order by time desc limit then reverse

            if (data) setLogs(data)
        }

        fetchInitialLogs()

        // Subscribe to new logs
        const channel = supabase
            .channel(`logs:${server.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'server_logs', filter: `server_id=eq.${server.id}` },
                (payload) => {
                    setLogs(prev => [...prev, payload.new as LogEntry])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [server.id])

    // Auto-scroll
    useEffect(() => {
        if (tailing && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs, tailing])

    return (
        <div className="glass-panel flex flex-col h-[600px] border-[#D13800]/20 lg:sticky lg:top-8">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-gray-400" />
                    <div>
                        <div className="text-sm font-bold text-white font-mono">{server.id}</div>
                        <div className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live Console
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {server.join_link && (
                        <a
                            href={server.join_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs font-bold uppercase rounded border border-green-500/30 flex items-center gap-1 transition"
                        >
                            <Play className="w-3 h-3" /> Join
                        </a>
                    )}
                    <button
                        onClick={onShutdown}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase rounded border border-red-500/30 flex items-center gap-1 transition"
                    >
                        <Power className="w-3 h-3" /> Shutdown
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded lg:hidden">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Log Output */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs bg-[#0a0a0a] custom-scrollbar">
                {logs.length === 0 && <div className="text-gray-600 italic">Waiting for logs...</div>}
                {logs.map((log) => (
                    <div key={log.id} className="break-words">
                        <span className="text-gray-600 select-none mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={
                            log.msg_type === 'Error' ? 'text-red-400 font-bold' :
                                log.msg_type === 'Warning' ? 'text-yellow-400' :
                                    'text-gray-300'
                        }>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Controls */}
            <div className="p-2 border-t border-white/10 bg-black/40 text-[10px] text-gray-500 flex justify-between">
                <div>Total Lines: {logs.length}</div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={tailing} onChange={e => setTailing(e.target.checked)} />
                    <span>Auto-scroll</span>
                </label>
            </div>
        </div>
    )
}
