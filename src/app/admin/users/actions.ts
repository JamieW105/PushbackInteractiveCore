
"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'moderator' | 'staff' | 'user') {
    const supabase = await createClient()

    // 1. Auth Check - Only admins can change roles
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') {
        return { success: false, error: 'Insufficient permissions. Only Admins can modify roles.' }
    }

    // 2. Prevent self-demotion if the admin wants to be safe? 
    // Actually, let's just proceed, but maybe add a check if needed later.

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetUserId)

        if (error) throw error

        // 3. Log the change
        await supabase.from('bot_management_logs').insert({
            user_id: user.id,
            action: 'staff_role_update',
            details: { target: targetUserId, new_role: newRole }
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (err: any) {
        console.error("Role Update Error:", err)
        return { success: false, error: err.message }
    }
}

export async function deleteStaffProfile(targetUserId: string) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') {
        return { success: false, error: 'Only Admins can delete profiles.' }
    }

    try {
        // We can't delete from auth.users easily from client-side without service role, 
        // so we'll just set their role to 'user' or remove the profile if RLS allows.
        // Actually, schema has cascade, but usually we just demote.

        const { error } = await supabase
            .from('profiles')
            .update({ role: 'user' })
            .eq('id', targetUserId)

        if (error) throw error

        revalidatePath('/admin/users')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
