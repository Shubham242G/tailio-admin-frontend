'use client';
import { useAuth } from '../../components/AuthContext';
import { motion } from 'framer-motion';
import { PawPrint, Users, Dog, CalendarCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, token } = useAuth();

  const stats = [
    { 
      title: "Total Customers", 
      value: "24", 
      icon: Users, 
      change: "+12%",
      changeType: "positive"
    },
    { 
      title: "Total Pets", 
      value: "156", 
      icon: Dog, 
      change: "+8%",
      changeType: "positive"
    },
    { 
      title: "Registrations", 
      value: "42", 
      icon: CalendarCheck, 
      change: "+5%",
      changeType: "positive"
    },
    { 
      title: "Revenue", 
      value: "₹24,500", 
      icon: TrendingUp, 
      change: "+18%",
      changeType: "positive"
    },
  ];

  const recentRegistrations = [
    { id: 1, petName: "Max", owner: "Rahul Sharma", date: "2024-01-15", status: "Completed" },
    { id: 2, petName: "Bella", owner: "Priya Singh", date: "2024-01-14", status: "Completed" },
    { id: 3, petName: "Charlie", owner: "Amit Kumar", date: "2024-01-13", status: "Pending" },
    { id: 4, petName: "Lucy", owner: "Neha Gupta", date: "2024-01-12", status: "Completed" },
  ];

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
            <p className="text-gray-500 mt-1">Manage customers, pets, and registrations</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-orange-100"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#f88013] to-[#ff9a44] rounded-full flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Welcome,</span>
              <span className="font-semibold text-[#f88013] ml-1">
                {user?.name || user?.email || 'Admin'} 👑
              </span>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#f88013]/10 to-[#ff9a44]/10 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[#f88013]" />
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Registrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-orange-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
              <Link 
                href="/dashboard/admin/registrations" 
                className="text-sm text-[#f88013] hover:text-[#e06a0a] font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            
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
                  {recentRegistrations.map((reg, idx) => (
                    <tr key={reg.id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-medium">{reg.petName}</td>
                      <td className="py-3 px-4 text-gray-600">{reg.owner}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{reg.date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reg.status === 'Completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/dashboard/admin/customers"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group"
              >
                <span className="font-medium text-gray-700">Manage Customers</span>
                <span className="text-[#f88013] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/dashboard/admin/pets"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group"
              >
                <span className="font-medium text-gray-700">Manage Pets</span>
                <span className="text-[#f88013] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/dashboard/admin/salesmen"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group"
              >
                <span className="font-medium text-gray-700">Manage Salesmen</span>
                <span className="text-[#f88013] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/dashboard/admin/reports"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group"
              >
                <span className="font-medium text-gray-700">View Reports</span>
                <span className="text-[#f88013] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50/30 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-[#f88013]/10 to-[#ff9a44]/10 rounded-full flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-[#f88013]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">New pet registration</span> - Max was registered by Rahul Sharma
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}