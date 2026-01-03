const ADMIN_CREDENTIALS = [
    { user: "admin", pass: "admin" },
    { user: process.env.ADMIN_USER_1, pass: process.env.ADMIN_PASS_1 },
    { user: process.env.ADMIN_USER_2, pass: process.env.ADMIN_PASS_2 },
    { user: process.env.ADMIN_USER_3, pass: process.env.ADMIN_PASS_3 },
    { user: process.env.ADMIN_USER_4, pass: process.env.ADMIN_PASS_4 },
]

export function checkAdminCredentials(username: string, pass: string) {
    return ADMIN_CREDENTIALS.some(
        cred => cred.user === username && cred.pass === pass
    )
}
