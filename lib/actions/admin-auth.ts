'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { checkAdminCredentials } from '@/lib/utils/admin-validation'

export async function getAdminCookieStore() {
    return await cookies()
}

export async function loginAdmin(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (checkAdminCredentials(username, password)) {
        const cookieStore = await getAdminCookieStore()

        // Set cookie for 1 day
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        })

        redirect('/admin/dashboard')
    } else {
        return { error: 'Invalid credentials' }
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    redirect('/admin/login')
}

export async function verifyAdmin() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    return !!session
}
