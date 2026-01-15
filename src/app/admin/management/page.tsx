
"use client"

import { useState, useEffect } from 'react'
import { Settings, Shield, Ban, UserX, Clock, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { manageUser } from './actions'

export default function ManagementPage() {
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<'moderation' | 'settings'>('moderation')

    // Guild Settings State
    const [guildId, setGuildId] = useState('')
    const [loadingSettings, setLoadingSettings] = useState(false)

    // Moderation Form State
    const [targetId, setTargetId] = useState('')
    const [reason, setReason] = useState('')
    const [duration, setDuration] = useState(60) // minutes
    const [modAction, setModAction] = useState<'kick' | 'ban' | 'timeout'>('timeout')
    const [processing, setProcessing] = useState(false)

    // Load Settings
    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('bot_settings').select('value').eq('key', 'mgmt_guild_id').maybeSingle()
            if (data?.value) setGuildId(data.value)
        }
        fetchSettings()
    }, [])

    const handleSaveGuild = async () => {
        setLoadingSettings(true)
        const { error } = await supabase.from('bot_settings').upsert({ key: 'mgmt_guild_id', value: guildId })
        setLoadingSettings(false)
        if (!error) alert("Guild ID Saved")
    }

    const handleExecute = async () => {
        if (!targetId) return alert("Please enter a User ID")
        if (!guildId) return alert("Please configure the Guild ID in Settings first.")

        // Confirmation
        if (!confirm(`Are you sure you want to ${modAction.toUpperCase()} user ${targetId}?`)) return

        setProcessing(true)
        const res = await manageUser(modAction, targetId, reason, duration)
        setProcessing(false)

        if (res.success) {
            alert("Success: " + res.message)
            setTargetId('')
            setReason('')
        } else {
            alert("Error: " + res.error)
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Bot Management
                    </h1>
                    <p className="text-gray-400">Member moderation and server administration.</p>
                </div>

                {/* SETTINGS TOGGLE */}
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setActiveTab('moderation')}
                        className={`px-4 py-2 rounded-md text-sm transition ${activeTab === 'moderation' ? 'bg-[#D13800] text-white shadow-glow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Moderation
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-md text-sm transition ${activeTab === 'settings' ? 'bg-[#D13800] text-white shadow-glow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {activeTab === 'moderation' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT: FORM */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="glass-panel p-6 space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
                                <Shield className="w-5 h-5 text-red-500" /> Administrative Actions
                            </h2>

                            {/* ACTION TYPE SELECTOR */}
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setModAction('timeout')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${modAction === 'timeout' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                                >
                                    <Clock className="w-6 h-6" />
                                    <span className="font-bold">Timeout</span>
                                </button>
                                <button
                                    onClick={() => setModAction('kick')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${modAction === 'kick' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                                >
                                    <UserX className="w-6 h-6" />
                                    <span className="font-bold">Kick</span>
                                </button>
                                <button
                                    onClick={() => setModAction('ban')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${modAction === 'ban' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                                >
                                    <Ban className="w-6 h-6" />
                                    <span className="font-bold">Ban</span>
                                </button>
                            </div>

                            {/* INPUTS */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Target User ID</label>
                                    <input
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                        placeholder="e.g. 1454317703706837056"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 font-mono focus:border-[#D13800] outline-none transition"
                                    />
                                </div>

                                {modAction === 'timeout' && (
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Duration (Minutes)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 font-mono focus:border-[#D13800] outline-none transition"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Reason (Audit Log)</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder={`Why are you ${modAction}ing this user?`}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 h-24 resize-none focus:border-[#D13800] outline-none transition"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleExecute}
                                disabled={processing}
                                className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition shadow-lg
                                    ${modAction === 'timeout' ? 'bg-yellow-600 hover:bg-yellow-500' : ''}
                                    ${modAction === 'kick' ? 'bg-orange-600 hover:bg-orange-500' : ''}
                                    ${modAction === 'ban' ? 'bg-red-600 hover:bg-red-500' : ''}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {processing ? <Loader2 className="animate-spin" /> : <Shield className="w-5 h-5" />}
                                Confirm {modAction.charAt(0).toUpperCase() + modAction.slice(1)}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: INFO/ACTIVITY */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 border-l-4 border-l-blue-500">
                            <h3 className="font-bold text-white mb-2">Instructions</h3>
                            <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                                <li>Ensure the bot has a higher role than the user you are trying to moderate.</li>
                                <li>User IDs can be found by enabling 'Developer Mode' in Discord settings.</li>
                                <li>Timeouts are capped at 28 days by Discord API.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                // SETTINGS TAB
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="glass-panel p-6 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-400" /> Configuration
                        </h2>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block uppercase font-bold tracking-wider">Management Guild ID</label>
                            <div className="flex gap-2">
                                <input
                                    value={guildId}
                                    onChange={(e) => setGuildId(e.target.value)}
                                    placeholder="Server ID where bot manages members"
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 font-mono focus:border-[#D13800] outline-none transition"
                                />
                                <button
                                    onClick={handleSaveGuild}
                                    disabled={loadingSettings}
                                    className="bg-white/5 hover:bg-white/10 px-4 rounded-lg border border-white/10 transition flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> {loadingSettings ? 'Saving' : 'Save'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">The bot must be present in this server to perform actions.</p>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <label className="text-sm text-gray-400 mb-3 block uppercase font-bold tracking-wider">Bot Invitation</label>

                            <a
                                href="https://discord.com/api/oauth2/authorize?client_id=1454334056945680430&permissions=8&scope=bot%20applications.commands"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#5865F2]/20 text-white border border-[#5865F2]/50 rounded-lg hover:bg-[#5865F2]/30 transition"
                            >
                                <span className="text-lg">🤖</span> Add Management Bot to Server
                            </a>
                            <p className="text-xs text-gray-500 mt-2 text-center">Using generic Client ID. Update if using a different bot for management.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
