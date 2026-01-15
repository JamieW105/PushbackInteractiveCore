
"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Calendar, MessageSquare, Plus, Save, Send, Trash2, Users, GripVertical, Copy, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendQotd } from './actions'

type QotdMode = 'reaction' | 'thread'
type PingType = 'user' | 'role'

interface Ping {
    id: string
    type: PingType
    name: string
}

interface Option {
    label: string
    emoji: string
}

interface DefaultQuestion {
    id: string
    question: string
    title?: string
    mode: QotdMode
    options?: Option[]
}


export default function QotdPage() {
    const [activeTab, setActiveTab] = useState<'create' | 'defaults'>('create')
    const [defaults, setDefaults] = useState<DefaultQuestion[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchDefaults = async () => {
            const { data } = await supabase
                .from('qotd_posts')
                .select('*')
                .eq('is_template', true)

            if (data) {
                // Map DB fields to Frontend interface if needed
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    question: d.question,
                    title: d.title,
                    mode: d.mode,
                    options: d.options
                }))
                setDefaults(mapped)
            }
        }

        if (activeTab === 'defaults') {
            fetchDefaults()
        }
    }, [activeTab])

    // Form State
    const [mode, setMode] = useState<QotdMode>('reaction')
    const [title, setTitle] = useState('')
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState<Option[]>([{ label: 'Yes', emoji: '✅' }, { label: 'No', emoji: '❌' }])
    const [pings, setPings] = useState<Ping[]>([])

    // New input states
    const [newPingId, setNewPingId] = useState('')
    const [newPingType, setNewPingType] = useState<PingType>('role')

    // Channel Settings
    const [channelId, setChannelId] = useState('')
    const [loadingSettings, setLoadingSettings] = useState(false)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('bot_settings').select('value').eq('key', 'qotd_channel_id').maybeSingle()
            if (data?.value) setChannelId(data.value)
        }
        fetchSettings()
    }, [])

    const saveChannelId = async () => {
        setLoadingSettings(true)
        const { error } = await supabase.from('bot_settings').upsert({
            key: 'qotd_channel_id',
            value: channelId
        })
        setLoadingSettings(false)
        if (!error) {
            // Optional: Show toast
        }
    }

    const handleSend = async () => {
        if (!channelId) {
            alert("Please set a Target Channel ID first.")
            return
        }
        if (!question) {
            alert("Please enter a question.")
            return
        }
        setSending(true)
        const res = await sendQotd({
            question,
            title,
            mode,
            options: mode === 'reaction' ? options : [],
            pings,
            channelId
        })
        setSending(false)
        if (res.success) {
            alert("Posted successfully!")
            // Optional: clear form
        } else {
            alert("Error: " + res.error)
        }
    }

    const handleAddOption = () => {
        setOptions([...options, { label: '', emoji: '' }])
    }

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index))
    }

    const handleOptionChange = (index: number, field: keyof Option, value: string) => {
        const newOptions = [...options]
        newOptions[index][field] = value
        setOptions(newOptions)
    }

    const handleAddPing = () => {
        if (!newPingId) return
        setPings([...pings, { id: newPingId, type: newPingType, name: newPingId }])
        setNewPingId('')
    }

    const handleRemovePing = (index: number) => {
        setPings(pings.filter((_, i) => i !== index))
    }

    const loadDefault = (def: DefaultQuestion) => {
        setTitle(def.title || '')
        setQuestion(def.question)
        setMode(def.mode)
        if (def.options) setOptions(def.options)
        else setOptions([{ label: 'Yes', emoji: '✅' }, { label: 'No', emoji: '❌' }])
        setPings([])
        setActiveTab('create')
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    QOTD Management
                </h1>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={cn("px-4 py-2 rounded-md text-sm transition-all", activeTab === 'create' ? "bg-[#D13800] text-white shadow-glow" : "text-gray-400 hover:text-white")}
                    >
                        Create Post
                    </button>
                    <button
                        onClick={() => setActiveTab('defaults')}
                        className={cn("px-4 py-2 rounded-md text-sm transition-all", activeTab === 'defaults' ? "bg-[#D13800] text-white shadow-glow" : "text-gray-400 hover:text-white")}
                    >
                        Default Questions
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: EDITOR OR DEFAULTS */}
                {activeTab === 'create' ? (
                    <div className="space-y-6">
                        <div className="glass-panel p-6 space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-pbi-purple" />
                                Configure Post
                            </h2>

                            {/* CHANNEL/SETTINGS HEADER */}
                            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Target Channel ID</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={channelId}
                                            onChange={(e) => setChannelId(e.target.value)}
                                            placeholder="123456789..."
                                            className="flex-1 bg-black/40 border-b border-white/10 focus:border-[#D13800] outline-none py-1 text-sm font-mono text-gray-300 transition-colors"
                                        />
                                        <button
                                            onClick={saveChannelId}
                                            disabled={loadingSettings}
                                            className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded border border-white/10 transition"
                                        >
                                            {loadingSettings ? 'Saving...' : 'Set Default'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* MODE SELECTION */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Interaction Mode</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setMode('reaction')}
                                        className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", mode === 'reaction' ? "border-[#D13800] bg-[#D13800]/10 shadow-glow" : "border-white/10 hover:bg-white/5")}
                                    >
                                        <span className="text-2xl">👍</span>
                                        <span className="font-medium">Reaction Poll</span>
                                        <span className="text-xs text-gray-500 text-center">Users vote with emojis</span>
                                    </button>
                                    <button
                                        onClick={() => setMode('thread')}
                                        className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", mode === 'thread' ? "border-[#D13800] bg-[#D13800]/10 shadow-glow" : "border-white/10 hover:bg-white/5")}
                                    >
                                        <span className="text-2xl">💬</span>
                                        <span className="font-medium">Thread Discussion</span>
                                        <span className="text-xs text-gray-500 text-center">Creates a dedicated thread</span>
                                    </button>
                                </div>
                            </div>

                            {/* CONTENT INPUTS */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Title (Optional)</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Daily Check-in"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#D13800]/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Question Content</label>
                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="What is your question?"
                                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#D13800]/50 resize-none"
                                />
                            </div>

                            {/* OPTIONS (Reaction Mode Only) */}
                            {mode === 'reaction' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-400">Poll Options</label>
                                        <button onClick={handleAddOption} className="text-xs text-pbi-blue hover:text-white transition flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> Add Option
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="cursor-grab p-2 text-gray-600 hover:text-gray-400">
                                                    <GripVertical className="w-5 h-5" />
                                                </div>
                                                <input
                                                    value={opt.emoji}
                                                    onChange={(e) => handleOptionChange(idx, 'emoji', e.target.value)}
                                                    placeholder="Emoji"
                                                    className="w-16 bg-black/40 border border-white/10 rounded-lg p-2 text-center"
                                                />
                                                <input
                                                    value={opt.label}
                                                    onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                                                    placeholder="Answer Label"
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2"
                                                />
                                                <button onClick={() => handleRemoveOption(idx)} className="p-2 text-red-500/50 hover:text-red-500 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PINGS */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Target Audience (Pings)
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={newPingType}
                                        onChange={(e) => setNewPingType(e.target.value as PingType)}
                                        className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm"
                                    >
                                        <option value="role">Role</option>
                                        <option value="user">User</option>
                                    </select>
                                    <input
                                        value={newPingId}
                                        onChange={(e) => setNewPingId(e.target.value)}
                                        placeholder="Enter ID / Name"
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-sm"
                                    />
                                    <button onClick={handleAddPing} className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm">
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {pings.map((ping, idx) => (
                                        <span key={idx} className="bg-pbi-blue/20 border border-pbi-blue/30 text-blue-200 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            {ping.type === 'role' ? '@' : '@user:'}{ping.name}
                                            <button onClick={() => handleRemovePing(idx)} className="hover:text-white"><XIcon className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#D13800] text-white py-3 rounded-lg font-semibold hover:bg-[#942200] transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {sending ? 'Posting...' : 'Post Now'}
                            </button>
                            <button className="flex items-center justify-center gap-2 px-6 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition">
                                <Calendar className="w-4 h-4" /> Schedule
                            </button>
                            <button className="flex items-center justify-center gap-2 px-6 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition">
                                <Save className="w-4 h-4" /> Save Default
                            </button>
                            <a
                                href="https://discord.com/api/oauth2/authorize?client_id=1454317703706837056&permissions=8&scope=bot%20applications.commands"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 bg-[#5865F2]/20 text-white border border-[#5865F2]/50 rounded-lg hover:bg-[#5865F2]/30 transition"
                            >
                                <span className="text-lg">🤖</span> Add Bot
                            </a>
                        </div>
                    </div>
                ) : (
                    // DEFAULTS TAB
                    <div className="space-y-4">
                        {defaults.map((def) => (
                            <div key={def.id} className="glass-panel p-4 flex items-center justify-between group hover:border-pbi-blue/50 transition">
                                <div>
                                    <div className="font-bold flex items-center gap-2">
                                        {def.title}
                                        <span className="text-[10px] uppercase bg-white/10 px-1.5 rounded">{def.mode}</span>
                                    </div>
                                    <div className="text-sm text-gray-400 line-clamp-1">{def.question}</div>
                                </div>
                                <button
                                    onClick={() => loadDefault(def)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-pbi-blue"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <div className="text-center text-xs text-gray-500 pt-4">
                            Fetching from 'qotd_defaults' table...
                        </div>
                    </div>
                )}

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-400">Preview</h2>
                    <div className="glass-panel p-6 relative overflow-hidden font-sans text-[15px] leading-snug">
                        {/* HEAD */}
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-pbi-blue/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">🤖</span>
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white hover:underline cursor-pointer">QOTD Bot</span>
                                    <span className="bg-[#5865F2] text-[10px] text-white px-1.5 rounded-[3px] py-[0.5px] flex items-center h-[15px] font-medium">BOT</span>
                                    <span className="text-xs text-gray-400 ml-1">Today at 12:00 PM</span>
                                </div>

                                {/* MESSAGE BODY - Based on Request */}
                                <div className="text-[#dbdee1] space-y-4 pt-1">
                                    {/* PING Section */}
                                    {pings.length > 0 && (
                                        <div className="text-[#c9cdfb] bg-[#3f448c] bg-opacity-30 inline rounded-[3px] px-0.5 cursor-pointer hover:bg-[#5865F2] hover:text-white transition-colors">
                                            {pings.map(p => p.type === 'role' ? `@${p.name} ` : `@${p.name} `).join(' ')}
                                        </div>
                                    )}

                                    {/* TITLE & QUESTION */}
                                    <div>
                                        {title && <div className="font-bold">{title} ({question})</div>}
                                        {!title && <div className="font-bold">{question || "Question Text..."}</div>}
                                    </div>

                                    {/* REACTION MODE SPECIFIC */}
                                    {mode === 'reaction' && options.length > 0 && (
                                        <div className="space-y-1">
                                            {options.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <span>({opt.emoji || '⚪'})</span>
                                                    <span>{opt.label || 'Option Label'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* THREAD MODE SPECIFIC */}
                                    {mode === 'thread' && (
                                        <div>
                                            <div className="italic text-gray-400 text-sm flex items-center gap-1">
                                                Thread with the question as the title.
                                            </div>
                                            {/* Mock Thread UI */}
                                            <div className="mt-2 pl-3 border-l-2 border-[#383a40] flex items-center gap-2 text-gray-400 text-sm hover:bg-[#32353b] p-2 rounded cursor-pointer transition">
                                                <MessageSquare className="w-4 h-4" />
                                                <span className="font-semibold text-white">{title || question || "Thread Title"}</span>
                                                <span className="ml-auto text-xs">Active now</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    )
}
