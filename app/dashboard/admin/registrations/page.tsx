'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { motion } from 'framer-motion';
import { FileText, User, Dog, Calendar, CheckCircle, XCircle, Loader2, Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../lib/api';

interface Registration {
  _id: string;
  pet: {
    _id: string;
    name: string;
    owner: {
      name: string;
      email: string;
    };
  };
  documents: any[];
  registrationTriggered: boolean;
  registrationTriggeredAt: string;
  createdAt: string;
  isComplete: boolean;
}

export default function AdminRegistrations() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    if (token) {
      fetchRegistrations();
    }
  }, [token]);

  const fetchRegistrations = async () => {
    try {
      const data = await api.admin.getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.pet?.name?.toLowerCase().includes(search.toLowerCase()) ||
      reg.pet?.owner?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? !reg.registrationTriggered :
      filter === 'completed' ? reg.registrationTriggered : true;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
          <p className="text-gray-500 mt-1">Manage all registration applications</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by pet or owner name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Pet Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Documents</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, index) => (
                  <motion.tr
                    key={reg._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{reg.pet?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{reg.pet?.owner?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">
                        {reg.documents?.length || 0}/4
                      </span>
                    </td>
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
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/admin/pets/${reg.pet?._id}`}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No registrations found</p>
          </div>
        )}
      </div>
    </div>
  );
}