
import Link from 'next/link'
import {
    LayoutDashboard,
    MessageSquare,
    Settings,
    LogOut,
    ShieldAlert,
    Users,
    Gamepad2,
    Hammer,
    Code,
    RefreshCw
} from 'lucide-react'


import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/admin/SignOutButton'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="h-screen w-full bg-black flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 h-full border-r border-[#D13800]/20 bg-black/50 hidden md:flex md:flex-col relative shrink-0">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-[#D13800]" />
                        PBI Admin
                    </h2>
                </div>

                <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
                    <NavItem href="/admin/dashboard" icon={<LayoutDashboard />} label="Overview" active />
                    <div className="pt-4 pb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Hammer className="w-3 h-3 text-[#D13800]" />
                        Moderation
                    </div>
                    <NavItem href="/admin/qotd" icon={<MessageSquare />} label="QOTD Bot" />
                    <NavItem href="/admin/management" icon={<ShieldAlert />} label="Discord Bot" />
                    <NavItem href="/admin/roblox" icon={<Gamepad2 />} label="Roblox" />

                    <div className="pt-4 pb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Code className="w-3 h-3 text-[#D13800]" />
                        Development
                    </div>
                    <NavItem href="/admin/developers" icon={<Code />} label="Developers" />
                    <NavItem href="/admin/update" icon={<RefreshCw />} label="Update" />

                    <div className="pt-4 pb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        System
                    </div>
                    <NavItem href="/admin/users" icon={<Users />} label="Staff Access" />
                </nav>

                <div className="p-4 border-t border-white/10 mt-auto">
                    <SignOutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto relative bg-black">
                {children}
            </main>
        </div>
    )
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                ? 'bg-[#D13800]/10 text-[#D13800] border border-[#D13800]/20 shadow-[0_0_15px_-5px_rgba(209,56,0,0.3)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {/* Clone icon to enforce size if needed, or rely on lucid default */}
            <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </Link>
    )
}
