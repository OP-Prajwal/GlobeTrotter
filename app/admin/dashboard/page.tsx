import { verifyAdmin } from "@/lib/actions/admin-auth";
import { getAdminDashboardData } from "@/lib/actions/admin-data";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
    const isAuthenticated = await verifyAdmin();

    if (!isAuthenticated) {
        redirect("/admin/login");
    }

    const dashboardData = await getAdminDashboardData();

    return <AdminDashboardClient
        initialUsers={dashboardData.users}
        initialCities={dashboardData.cities}
        initialActivities={dashboardData.activities}
        trends={dashboardData.trends}
        stats={dashboardData.stats}
    />;
}
