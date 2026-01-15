"use client"

import { useState } from 'react'
import {
    Gamepad2, Send, Zap, MessageCircle, AlertTriangle,
    Loader2, Search, User, Globe, Activity, Terminal
} from 'lucide-react'
import { toast } from 'sonner'
import { sendRobloxMessage, getRobloxPlayerInfo } from './actions'
import Image from 'next/image'

export default function RobloxPage() {
    const [usernameInput, setUsernameInput] = useState('')
    const [player, setPlayer] = useState<any>(null)
    const [searching, setSearching] = useState(false)
    const [command, setCommand] = useState('kick')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!usernameInput) return toast.error("Enter a username")

        setSearching(true)
        setPlayer(null)
        const res = await getRobloxPlayerInfo(usernameInput)
        setSearching(false)

        if (res.success && res.player) {
            setPlayer(res.player)
            toast.success(`Found ${res.player.username}`)
        } else {
            toast.error(res.error || "Player not found")
        }
    }

    const handleSend = async () => {
        if (!player) return

        setLoading(true)
        const toastId = toast.loading(`Sending ${command} to ${player.username}...`)

        const res = await sendRobloxMessage(player.userId.toString(), command, {
            reason: reason || "No reason provided",
            timestamp: Date.now(),
            username: player.username
        })

        setLoading(false)

        if (res.success) {
            toast.success("Command Dispatched", { id: toastId, description: "Action sent to game servers." })
            setReason('')
        } else {
            toast.error("Failed to Send", { id: toastId, description: res.error })
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto pb-20">
            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Gamepad2 className="w-8 h-8 text-[#D13800]" />
                    Roblox
                </h1>
                <p className="text-gray-400">Live Player Management & Server Signals</p>
            </div>

            {!player ? (
                /* INITIAL SEARCH VIEW */
                <div className="max-w-xl mx-auto pt-10">
                    <div className="glass-panel p-8 space-y-6 text-center">
                        <div className="w-16 h-16 bg-[#D13800]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D13800]/30 shadow-glow">
                            <Search className="w-8 h-8 text-[#D13800]" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Player Lookup</h2>
                            <p className="text-gray-400">Enter a Roblox username to view their status and manage them.</p>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    placeholder="Roblox Username"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-[#D13800] outline-none transition text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching}
                                className="w-full py-4 bg-[#D13800] hover:bg-[#942200] text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xl shadow-[#D13800]/20"
                            >
                                {searching ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* PLAYER PROFILE VIEW */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* LEFT: PLAYER CARD */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="glass-panel overflow-hidden">
                            {/* Avatar */}
                            <div className="relative aspect-square bg-gradient-to-b from-[#D13800]/20 to-black overflow-hidden border-b border-white/5">
                                {player.avatarUrl ? (
                                    <Image
                                        src={player.avatarUrl}
                                        alt={player.username}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-700" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${player.isInThisGame
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : player.status === 'Offline'
                                        ? 'bg-gray-500/20 text-gray-400 border-white/10'
                                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    } shadow-lg backdrop-blur-md`}>
                                    {player.isInThisGame ? 'In Your Game' : player.status}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold leading-tight">{player.displayName}</h3>
                                    <p className="text-gray-500 font-mono text-sm">@{player.username}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-400">
                                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                        <Activity className="w-4 h-4 text-[#D13800]" />
                                        <span className="font-mono text-xs">{player.userId}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                        <Globe className="w-4 h-4 text-blue-400" />
                                        <span>{player.lastLocation}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2">Description</label>
                                    <p className="text-xs text-gray-400 leading-relaxed italic line-clamp-4">
                                        "{player.description}"
                                    </p>
                                </div>

                                <button
                                    onClick={() => setPlayer(null)}
                                    className="w-full mt-4 py-2 text-xs text-gray-500 hover:text-white transition"
                                >
                                    Search Different Player
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="glass-panel p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-[#D13800]" />
                                    Dispatch Signal
                                </h2>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Universal Topic: AdminActions</span>
                            </div>

                            <div className="space-y-6">
                                {/* COMMAND SELECT */}
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'kick', icon: Zap, label: 'Kick', color: 'red' },
                                        { id: 'message', icon: MessageCircle, label: 'Message', color: 'blue' },
                                        { id: 'warn', icon: AlertTriangle, label: 'Warn', color: 'yellow' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setCommand(opt.id)}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${command === opt.id
                                                ? `border-${opt.color}-500 bg-${opt.color}-500/10 text-${opt.color}-500 shadow-lg`
                                                : 'border-white/5 bg-white/5 opacity-50 hover:opacity-100 hover:bg-white/10'
                                                }`}
                                        >
                                            <opt.icon className="w-6 h-6" />
                                            <span className="font-bold text-sm tracking-wide">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* PAYLOAD */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Payload / Reason</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder={command === 'message' ? "Message text to display..." : "Reason for action..."}
                                        className="w-full bg-black/60 border border-white/10 rounded-xl p-4 h-32 resize-none focus:border-[#D13800] outline-none transition text-gray-200"
                                    />
                                </div>

                                {/* SUBMIT */}
                                <button
                                    onClick={handleSend}
                                    disabled={loading}
                                    className="w-full py-5 bg-[#D13800] hover:bg-[#942200] text-white rounded-xl font-bold shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 group"
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    <span className="uppercase tracking-widest text-sm">Execute {command} Sequence</span>
                                </button>
                            </div>
                        </div>

                        {/* INFO BOX */}
                        <div className="glass-panel p-6 border-l-4 border-l-[#D13800] bg-black/60">
                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#D13800]" />
                                Real-time Synchronization
                            </h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Executing a sequence will broadcast a message across all active servers in <code className="text-[#D13800]">Universe {process.env.ROBLOX_UNIVERSE_ID}</code>.
                                The target player will be located and processed within <span className="text-white">500ms</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
