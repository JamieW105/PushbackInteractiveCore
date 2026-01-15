import { Code } from 'lucide-react'
import { ServerList } from '@/components/admin/ServerList'

export default function DevelopersPage() {
    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Code className="w-8 h-8 text-[#D13800]" />
                        Developers
                    </h1>
                    <p className="text-gray-400">Manage development resources and integrations.</p>
                </div>
            </div>

            <ServerList />
        </div>
    )
}
