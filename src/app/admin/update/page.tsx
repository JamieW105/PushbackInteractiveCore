"use client"

import { useState } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { triggerSoftShutdown } from './actions'

export default function UpdatePage() {
    const [loading, setLoading] = useState(false)

    const handleUpdate = async () => {
        if (!confirm("Are you sure? This will migrate ALL active servers to the latest version by teleporting players.")) return

        setLoading(true)
        const res = await triggerSoftShutdown()
        setLoading(false)

        if (res.success) {
            toast.success("Update command sent! Servers starting migration.")
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <RefreshCw className="w-8 h-8 text-[#D13800]" />
                        Deployment & Updates
                    </h1>
                    <p className="text-gray-400">Manage game version rollouts and server migration.</p>
                </div>
            </div>

            <div className="glass-panel p-8 border-l-4 border-l-[#D13800] space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#D13800]/10 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-[#D13800]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Deploy Update (Soft Shutdown)</h3>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            This action will send a signal to all active game servers.
                            Current servers will initiate a "Soft Shutdown", where all players are seamlessly teleported to a new server instance running the latest published version of the game.
                        </p>
                        <p className="text-sm text-gray-400 italic mb-6">
                            Note: Ensure you have published your latest changes to Roblox before clicking this.
                        </p>

                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="bg-[#D13800] hover:bg-[#D13800]/80 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                            {loading ? "Deploying..." : "Start Rolling Update"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
