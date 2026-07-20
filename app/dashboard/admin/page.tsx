'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { motion } from 'framer-motion';
import { 
  PawPrint, Users, Dog, CalendarCheck, 
  Award, Loader2, BookOpen, PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface DashboardStats {
  totalCustomers: number;
  totalPets: number;
  totalRegistrations: number;
  completedRegistrations: number;
  pendingRegistrations: number;
  recentRegistrations: number;
  stages: {
    stage0: number;
    stage1: number;
    stage2: number;
    stage3: number;
    stage4: number;
  };
}

interface RecentRegistration {
  _id: string;
  pet?: {
    _id: string;
    name: string;
    owner?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
  registrationTriggered: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentRegistrations();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await api.admin.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  const fetchRecentRegistrations = async () => {
    try {
      const data = await api.admin.getRegistrations();
      // data is already an array from our updated API
      const registrations = Array.isArray(data) ? data : [];
      setRecentRegistrations(registrations.slice(0, 5));
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError('Failed to load recent registrations');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get pet name
  const getPetName = (reg: RecentRegistration): string => {
    if (reg.pet && typeof reg.pet === 'object' && reg.pet.name) {
      return reg.pet.name;
    }
    return 'Unknown Pet';
  };

  // Helper function to safely get owner name
  const getOwnerName = (reg: RecentRegistration): string => {
    if (reg.pet && typeof reg.pet === 'object' && reg.pet.owner) {
      if (typeof reg.pet.owner === 'object' && reg.pet.owner.name) {
        return reg.pet.owner.name;
      }
    }
    return 'Unknown Owner';
  };

  const statCards = stats ? [
    { 
      title: "Total Customers", 
      value: stats.totalCustomers, 
      icon: Users, 
      change: "+12%",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Total Pets", 
      value: stats.totalPets, 
      icon: Dog, 
      change: "+8%",
      color: "from-green-500 to-green-600"
    },
    { 
      title: "Registrations", 
      value: stats.totalRegistrations, 
      icon: CalendarCheck, 
      change: "+5%",
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Completed", 
      value: stats.completedRegistrations, 
      icon: Award, 
      change: "+18%",
      color: "from-orange-500 to-orange-600"
    },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchDashboardData();
              fetchRecentRegistrations();
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage customers, pets, registrations, and content</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-orange-100"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Welcome,</span>
              <span className="font-semibold text-orange-600 ml-1">
                {user?.name || user?.email || 'Admin'} 👑
              </span>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Registration Progress Overview */}
        {stats && stats.totalPets > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Registration Progress Overview</h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">{stats.stages.stage0}</div>
                <div className="text-xs text-gray-500">Not Started</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-gray-400 h-1 rounded-full" style={{ width: `${(stats.stages.stage0 / stats.totalPets) * 100}%` }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.stages.stage1}</div>
                <div className="text-xs text-gray-500">Documents Ready</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${(stats.stages.stage1 / stats.totalPets) * 100}%` }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.stages.stage2}</div>
                <div className="text-xs text-gray-500">Form Submitted</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${(stats.stages.stage2 / stats.totalPets) * 100}%` }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.stages.stage3}</div>
                <div className="text-xs text-gray-500">Awaiting License</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${(stats.stages.stage3 / stats.totalPets) * 100}%` }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.stages.stage4}</div>
                <div className="text-xs text-gray-500">License Delivered</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: `${(stats.stages.stage4 / stats.totalPets) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Registrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
              <Link 
                href="/dashboard/admin/registrations" 
                className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            
            {recentRegistrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No registrations found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Pet Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Owner</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRegistrations.map((reg) => (
                      <tr key={reg._id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors">
                        <td className="py-3 px-4 text-gray-900 font-medium">{getPetName(reg)}</td>
                        <td className="py-3 px-4 text-gray-600">{getOwnerName(reg)}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reg.registrationTriggered 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {reg.registrationTriggered ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/dashboard/admin/customers"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group"
              >
                <span className="font-medium text-gray-700">Manage Customers</span>
                <span className="text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/dashboard/admin/pets"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group"
              >
                <span className="font-medium text-gray-700">Manage Pets</span>
                <span className="text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/dashboard/admin/registrations"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group"
              >
                <span className="font-medium text-gray-700">Review Registrations</span>
                <span className="text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/dashboard/admin/documents"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group"
              >
                <span className="font-medium text-gray-700">Pending Documents</span>
                <span className="text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              
              {/* Blog Management Section */}
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Content Management</div>
                <Link 
                  href="/dashboard/admin/blogs"
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Manage Blog Posts</span>
                  </div>
                  <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}