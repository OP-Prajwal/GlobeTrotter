"use client";

import { useState } from "react";
import { Search, Filter, Layers, LayoutGrid, Users, Map, Activity, BarChart3, LogOut, UserCircle, ArrowUpDown, Ban, Trash2, ChevronDown, Check } from "lucide-react";
import { TripDistributionChart, UserGrowthChart } from "@/components/admin/AdminCharts";
import { logoutAdmin } from "@/lib/actions/admin-auth";

type ViewType = 'users' | 'cities' | 'activities' | 'trends';

interface AdminDashboardClientProps {
    initialUsers: any[];
    initialCities: any[];
    initialActivities: any[];
    trends: any[];
    stats: {
        totalUsers: number;
        totalTrips: number;
        activeTrips: number;
    }
}

export default function AdminDashboardClient({
    initialUsers = [],
    initialCities = [],
    initialActivities = [],
    trends = [],
    stats = { totalUsers: 0, totalTrips: 0, activeTrips: 0 }
}: AdminDashboardClientProps) {
    const [activeView, setActiveView] = useState<ViewType>('trends');
    const [searchQuery, setSearchQuery] = useState("");

    // --- State for Controls ---
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterType, setFilterType] = useState<'all' | 'most_visited'>('all');

    // --- Helpers ---
    // --- Helpers ---
    const Dropdown = ({ label, icon: Icon, options, onSelect, value }: any) => {
        const [isOpen, setIsOpen] = useState(false);
        const selectedLabel = options.find((o: any) => o.value === value)?.label || label;

        return (
            <div className="relative group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    className={`
                        glass-button px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-3 transition-all duration-300
                        ${isOpen ? "bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "hover:bg-white/5 hover:border-white/20"}
                    `}
                >
                    <Icon className={`w-4 h-4 ${isOpen ? "text-primary" : "text-white/70"}`} />
                    <span className="text-white/90">{label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <div className={`
                    absolute top-full mt-2 left-0 w-56 p-1 rounded-xl shadow-2xl overflow-hidden z-50
                    bg-[#0A0A0F]/90 backdrop-blur-2xl border border-white/10
                    transition-all duration-200 origin-top
                    ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
                `}>
                    {options.map((opt: any) => {
                        const isSelected = opt.value === value;
                        return (
                            <div
                                key={opt.label}
                                onClick={() => {
                                    onSelect(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all flex items-center justify-between group/item
                                    ${isSelected ? "bg-primary/20 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}
                                `}
                            >
                                <span className="font-medium">{opt.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderHeader = () => (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div
                    onClick={() => setActiveView('trends')}
                    className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Layers className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        GlobeTrotter
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="glass-button px-4 py-2 rounded-full flex items-center gap-3 cursor-pointer group hover:bg-white/10 transition-all">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <UserCircle className="w-5 h-5 text-white/80" />
                            </div>
                        </div>
                        <span className="text-sm font-medium pr-2">Admin</span>
                    </div>
                    <form action={logoutAdmin}>
                        <button className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-colors" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );

    const renderControlBar = () => (
        <div className="glass rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-3 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    placeholder={`Search ${activeView}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/20 outline-none transition-all"
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <Dropdown
                    label="Group By"
                    icon={LayoutGrid}
                    value={activeView === 'users' ? null : activeView} // simplified logic, mainly for Cities/Activities
                    options={[
                        { label: 'Default', value: 'trends' },
                        { label: 'Location (Cities)', value: 'cities' },
                        { label: 'Popular Activities', value: 'activities' }
                    ]}
                    onSelect={(val: ViewType) => setActiveView(val)}
                />
                <Dropdown
                    label="Filter"
                    icon={Filter}
                    value={filterType}
                    options={[
                        { label: 'Show All', value: 'all' },
                        { label: 'Most Visited (>Avg)', value: 'most_visited' },
                        { label: 'Budget (Coming Soon)', value: 'budget' },
                    ]}
                    onSelect={(val: any) => val !== 'budget' && setFilterType(val)}
                />
                <Dropdown
                    label="Sort By"
                    icon={ArrowUpDown}
                    value={sortOrder}
                    options={[
                        { label: 'Most Visited (High-Low)', value: 'desc' },
                        { label: 'Least Visited (Low-High)', value: 'asc' }
                    ]}
                    onSelect={(val: 'asc' | 'desc') => setSortOrder(val)}
                />
            </div>
        </div>
    );

    const renderNavigation = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { id: 'users', icon: Users, label: "Manage Users" },
                { id: 'cities', icon: Map, label: "Popular Cities" },
                { id: 'activities', icon: Activity, label: "Popular Activities" },
                { id: 'trends', icon: BarChart3, label: "User Trends" },
            ].map((item) => (
                <div
                    key={item.id}
                    onClick={() => setActiveView(item.id as ViewType)}
                    className={`
                        relative p-4 rounded-xl border cursor-pointer transition-all duration-300 group overflow-hidden
                        ${activeView === item.id
                            ? "bg-primary/20 border-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }
                    `}
                >
                    <div className="flex flex-col items-center gap-3 text-center z-10 relative">
                        <item.icon className={`w-8 h-8 ${activeView === item.id ? "text-primary" : "text-white/60 group-hover:text-white"}`} />
                        <span className={`text-sm font-medium ${activeView === item.id ? "text-white" : "text-white/60 group-hover:text-white"}`}>{item.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        // Generic Filter & Sort Logic
        const processData = (data: any[], key: string) => {
            let processed = data.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );

            if (filterType === 'most_visited' && key === 'visits') {
                // Simple logic: show items with visits > average
                const avg = processed.reduce((acc, curr) => acc + (curr[key] || 0), 0) / (processed.length || 1);
                processed = processed.filter(i => i[key] >= avg);
            }

            // Sort
            processed.sort((a, b) => {
                const valA = a[key] || 0;
                const valB = b[key] || 0;
                return sortOrder === 'desc' ? valB - valA : valA - valB;
            });

            return processed;
        };

        if (activeView === 'users') {
            const users = processData(initialUsers, 'trips');
            return (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Trips</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-400 border-green-500/20`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{user.trips}</td>
                                    <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <Ban className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <div className="p-8 text-center text-gray-500">No users found.</div>}
                </div>
            );
        }

        if (activeView === 'cities') {
            const cities = processData(initialCities, 'visits');
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cities.map(city => (
                        <div key={city.id} className="glass-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                    <Map className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{city.name}</h3>
                                    <p className="text-sm text-gray-400">{city.country || 'Unknown'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-white">{city.visits}</div>
                                <div className="text-xs text-green-400">Visits</div>
                            </div>
                        </div>
                    ))}
                    {cities.length === 0 && (
                        <div className="col-span-full p-8 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                            No cities data available yet.
                        </div>
                    )}
                </div>
            );
        }

        if (activeView === 'activities') {
            const activities = processData(initialActivities, 'popularity');
            return (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Most Popular Activities</h3>
                    <div className="space-y-6">
                        {activities.map((activity, index) => (
                            <div key={activity.id} className="relative">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 font-mono text-sm">0{index + 1}</span>
                                        <span className="font-medium text-white">{activity.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-primary">{activity.popularity}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                        style={{ width: `${activity.popularity}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        // Default: 'trends' view (The Charts)
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Metrics */}
                <div className="space-y-4 lg:col-span-3 xl:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Users", value: stats.totalUsers },
                        { label: "Total Trips", value: stats.totalTrips },
                        { label: "Active Trips", value: stats.activeTrips }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-6 flex flex-col items-center justify-center text-center">
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Chart Area */}
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        User & Trip Growth
                    </h3>
                    <UserGrowthChart data={trends} />
                </div>

                {/* Right Side Info & Pie Chart */}
                <div className="space-y-6">
                    <div className="glass-card p-6 min-h-[300px]">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Map className="w-5 h-5 text-blue-400" />
                            City Distribution
                        </h3>
                        <TripDistributionChart data={initialCities} />
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-white/0">
                        <h4 className="font-semibold text-white mb-2">Dashboard Insights</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Data now reflects real-time database statistics.
                            <br /><br />
                            <strong>User Trends</strong> indicate current platform growth.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#05050A] text-white relative selection:bg-primary/30 font-sans">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            {renderHeader()}

            <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                {renderControlBar()}
                {renderNavigation()}

                <div className="motion-safe:animate-fade-in transition-all duration-300">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
