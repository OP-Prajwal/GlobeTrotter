'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginValues, SignupValues } from '@/lib/validations/auth'

import { checkAdminCredentials } from '@/lib/utils/admin-validation'
import { getAdminCookieStore } from '@/lib/actions/admin-auth'

export async function login(data: LoginValues) {
    // 1. Check for Admin Login first
    // Use the email field as the username for admin login
    if (checkAdminCredentials(data.email, data.password)) {
        const cookieStore = await getAdminCookieStore()
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        })
        redirect('/admin/dashboard')
    }

    // 2. Proceed with regular user login
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(data: SignupValues) {
    const supabase = await createClient()

    const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                city: data.city,
                country: data.country,
                bio: data.bio,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // If email confirmation is enabled, session will be null
    if (authData.user && !authData.session) {
        return { success: true, message: "Account created! Please check your email to confirm your account." }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
