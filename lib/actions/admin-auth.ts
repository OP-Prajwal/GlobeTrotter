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

    const isValid = checkAdminCredentials(username, password);

    if (isValid) {
        const cookieStore = await getAdminCookieStore()
        const isSecure = process.env.NODE_ENV === 'production';

        // Set cookie for 1 day
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: isSecure,
            maxAge: 60 * 60 * 24,
            path: '/',
            sameSite: 'lax',
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
