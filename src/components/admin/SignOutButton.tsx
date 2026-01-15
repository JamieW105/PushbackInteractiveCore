
"use client"

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition w-full px-4 py-2 rounded-lg hover:bg-red-500/10"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    )
}
