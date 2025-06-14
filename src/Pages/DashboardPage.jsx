import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, FileText, BadgeCheck, UserPlus, Receipt, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import apiClient from '../Utils/apiClient';

// Simplified Stat Card Component
const StatCard = ({ title, value, Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <span className="text-gray-500 font-medium">{title}</span>
            <Icon className="w-6 h-6 text-gray-400" />
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value ?? '...'}</p>
        </div>
    </div>
);

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await apiClient('/api/admin/stats');
                setStats(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-6">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full p-6 bg-red-50 rounded-lg">
                 <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-xl font-bold text-red-700">Access Denied or Error</h2>
                 <p className="text-red-600 mt-2">{error}</p>
                 <p className="text-sm text-gray-500 mt-1">Ensure you are logged in as an administrator.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord Administrateur</h1>
                <p className="text-gray-600 mt-1">Bienvenue, {user ? `${user.prenom} ${user.nom}` : 'Admin'}.</p>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Revenu Total" value={`€${stats?.totalRevenue ?? 0}`} Icon={DollarSign} />
                <StatCard title="Abonnements Actifs" value={stats?.activeSubscriptions ?? 0} Icon={BadgeCheck} />
                <StatCard title="Utilisateurs Totals" value={stats?.totalUsers ?? 0} Icon={Users} />
                <StatCard title="Contenus Publiés" value={stats?.totalContent ?? 0} Icon={FileText} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-700 mb-4">Revenu Mensuel</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis unit="€" />
                            <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Revenu" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Add User Growth Chart here once API is ready */}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center"><UserPlus className="w-5 h-5 mr-2 text-blue-500" />Inscriptions Récentes</h3>
                    <ul className="space-y-4">
                        {stats?.recentUsers.map((u) => (
                            <li key={u._id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{u.prenom} {u.nom}</p>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                </div>
                                <span className="text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center"><Receipt className="w-5 h-5 mr-2 text-green-500" />Transactions Récentes</h3>
                    <p className="text-gray-500 text-sm">Les données de paiement seront affichées ici.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;