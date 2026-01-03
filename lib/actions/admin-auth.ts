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

    console.log("Login attempt:", { username, password });
    console.log("Checking credentials...");
    const isValid = checkAdminCredentials(username, password);
    console.log("Credentials valid:", isValid);

    if (isValid) {
        const cookieStore = await getAdminCookieStore()

        console.log("NODE_ENV:", process.env.NODE_ENV);
        const isSecure = process.env.NODE_ENV === 'production';
        console.log("Setting cookie with secure:", isSecure);

        // Set cookie for 1 day
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: isSecure,
            maxAge: 60 * 60 * 24,
            path: '/',
            sameSite: 'lax', // Add sameSite lax for better compatibility
        })

        console.log("Cookie set command issued");
        redirect('/admin/dashboard')
    } else {
        console.log("Invalid credentials");
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
    console.log("Verifying admin session from cookie:", session?.value);
    return !!session
}
