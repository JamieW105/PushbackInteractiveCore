
"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Users, ShieldCheck, ShieldAlert, Award,
    Trash2, Search, Loader2, MoreVertical,
    UserPlus, Mail, Calendar, User
} from 'lucide-react'
import { toast } from 'sonner'
import { updateUserRole } from './actions'
import Image from 'next/image'

interface Profile {
    id: string
    email: string
    username: string
    role: 'admin' | 'moderator' | 'staff' | 'user'
    avatar_url: string | null
    created_at: string
}

export default function StaffAccessPage() {
    const supabase = createClient()
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [updating, setUpdating] = useState<string | null>(null)

    const fetchProfiles = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('role', { ascending: true })

        if (error) {
            toast.error("Failed to load profiles")
        } else {
            setProfiles(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchProfiles()
    }, [])

    const handleRoleUpdate = async (userId: string, newRole: any) => {
        setUpdating(userId)
        const res = await updateUserRole(userId, newRole)
        setUpdating(null)

        if (res.success) {
            toast.success("Role updated successfully")
            fetchProfiles()
        } else {
            toast.error(res.error || "Update failed")
        }
    }

    const filteredProfiles = profiles.filter(p =>
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.username?.toLowerCase().includes(search.toLowerCase())
    )

    const roleColors = {
        admin: 'text-red-500 bg-red-500/10 border-red-500/20',
        moderator: 'text-[#D13800] bg-[#D13800]/10 border-[#D13800]/20',
        staff: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        user: 'text-gray-500 bg-black/40 border-white/5'
    }

    const roleIcons = {
        admin: <ShieldAlert className="w-4 h-4" />,
        moderator: <ShieldCheck className="w-4 h-4" />,
        staff: <Award className="w-4 h-4" />,
        user: <User className="w-4 h-4" />
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#D13800]" />
                        Staff Access
                    </h1>
                    <p className="text-gray-400">Manage administrative permissions and site access.</p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by email or username..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:border-[#D13800] outline-none transition"
                    />
                </div>
            </div>

            {/* LIST */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-10 w-40 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-6"><div className="h-6 w-20 bg-white/5 rounded-full" /></td>
                                        <td className="px-6 py-6"><div className="h-4 w-16 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-6"><div className="h-8 w-8 bg-white/5 ml-auto rounded" /></td>
                                    </tr>
                                ))
                            ) : filteredProfiles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : filteredProfiles.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D13800]/20 to-black border border-white/5 flex items-center justify-center overflow-hidden">
                                                {p.avatar_url ? (
                                                    <Image src={p.avatar_url} alt={p.username || 'User'} width={40} height={40} />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-600" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{p.username || 'Anonymous'}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {p.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border flex items-center gap-1.5 w-fit ${roleColors[p.role]}`}>
                                            {roleIcons[p.role]}
                                            {p.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {updating === p.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-[#D13800]" />
                                            ) : (
                                                <div className="flex bg-black/40 border border-white/5 rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {(['admin', 'moderator', 'staff', 'user'] as const).map((role) => (
                                                        <button
                                                            key={role}
                                                            onClick={() => handleRoleUpdate(p.id, role)}
                                                            disabled={p.role === role}
                                                            className={`px-3 py-1.5 text-[10px] font-bold uppercase transition hover:bg-white/10 ${p.role === role ? 'bg-[#D13800] text-white' : 'text-gray-500'}`}
                                                            title={`Set as ${role}`}
                                                        >
                                                            {role.charAt(0)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-6 border-l-4 border-l-[#D13800]">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-[#D13800]" />
                        Hierarchy Rules
                    </h3>
                    <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                        <li><strong className="text-white">Admins</strong> have full control over site content and roles.</li>
                        <li><strong className="text-white">Moderators</strong> can manage users and QOTD content.</li>
                        <li><strong className="text-white">Staff</strong> can create QOTD posts and view signals.</li>
                    </ul>
                </div>

                <div className="glass-panel p-6 border-l-4 border-l-blue-500">
                    <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-400">
                        <UserPlus className="w-5 h-5" />
                        Inviting Staff
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        To add new staff members, have them register on the site. Once registered, they will appear in this list as a <span className="text-white">'User'</span>.
                        You can then promote them to the appropriate role using the controls above.
                    </p>
                </div>
            </div>
        </div>
    )
}
