
import { Activity, Server, Users, MessageCircle } from 'lucide-react'

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Systems Overview</h1>
                <p className="text-gray-400">Welcome back, Administrator.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Members"
                    value="14,204"
                    change="+12% this week"
                    icon={<Users className="text-pbi-blue" />}
                />
                <StatCard
                    title="Active Servers"
                    value="8"
                    change="All operational"
                    icon={<Server className="text-green-400" />}
                />
                <StatCard
                    title="QOTD Engagement"
                    value="89%"
                    change="+5% vs last post"
                    icon={<MessageCircle className="text-pbi-purple" />}
                />
                <StatCard
                    title="API Latency"
                    value="42ms"
                    change="Stable"
                    icon={<Activity className="text-orange-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Log Placeholder */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Audit Logs</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 text-sm border-b border-white/5 pb-3">
                                <div className="w-2 h-2 rounded-full bg-pbi-blue" />
                                <span className="text-gray-400">10:4{i} AM</span>
                                <div>
                                    <span className="text-white font-medium">AdminUser</span> updated <span className="text-pbi-blue">QOTD Settings</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4">Bot Status</h3>
                    <div className="space-y-4">
                        <StatusRow name="QOTD Bot" status="Online" ping="24ms" />
                        <StatusRow name="Management Bot" status="Online" ping="31ms" />
                        <StatusRow name="Verification Service" status="Maintenance" ping="0ms" warning />
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
    return (
        <div className="glass-panel p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                    <div className="text-2xl font-bold text-white mt-1">{value}</div>
                </div>
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                    {icon}
                </div>
            </div>
            <div className="text-xs text-gray-500">{change}</div>
        </div>
    )
}

function StatusRow({ name, status, ping, warning }: { name: string, status: string, ping: string, warning?: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${warning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="font-medium text-gray-200">{name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">{ping}</span>
                <span className={`px-2 py-0.5 rounded textxs font-medium ${warning ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                    {status}
                </span>
            </div>
        </div>
    )
}
