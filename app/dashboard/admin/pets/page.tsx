'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { motion } from 'framer-motion';
import { Dog, User, Calendar, Award, Loader2, Eye, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../lib/api';

interface Pet {
  _id: string;
  name: string;
  breed: string;
  ageYears: number;
  ageMonths: number;
  registrationStage: number;
  owner: {
    name: string;
    email: string;
  };
  createdAt: string;
  registrationStatus?: {
    hasDocuments: number;
    totalDocuments: number;
    registrationTriggered: boolean;
  };
}

export default function AdminPets() {
  const { token } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (token) {
      fetchPets();
    }
  }, [token]);

  const fetchPets = async () => {
    try {
      const data = await api.admin.getPets();
      // data is already an array from our updated API
      setPets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadge = (stage: number) => {
    const stages = [
      { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
      { label: 'Documents Ready', color: 'bg-blue-100 text-blue-700' },
      { label: 'Form Submitted', color: 'bg-orange-100 text-orange-700' },
      { label: 'Awaiting License', color: 'bg-purple-100 text-purple-700' },
      { label: 'Complete', color: 'bg-green-100 text-green-700' }
    ];
    return stages[stage] || stages[0];
  };

  const filteredPets = pets.filter(pet =>
    pet.name?.toLowerCase().includes(search.toLowerCase()) ||
    pet.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">All Pets</h1>
          <p className="text-gray-500 mt-1">Manage all pets across all customers</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by pet name, owner, or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        {/* Pets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet, index) => {
            const stage = getStageBadge(pet.registrationStage);
            return (
              <motion.div
                key={pet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                    <Dog className="w-6 h-6 text-orange-600" />
                  </div>
                  <Link
                    href={`/dashboard/admin/pets/${pet._id}`}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{pet.name}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Owner: {pet.owner?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>Breed: {pet.breed || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Age: {pet.ageYears || 0} years {pet.ageMonths || 0} months</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stage.color}`}>
                      {stage.label}
                    </span>
                    {pet.registrationStage === 4 && (
                      <Award className="w-4 h-4 text-green-500" />
                    )}
                    {pet.registrationStatus && (
                      <span className="text-xs text-gray-500">
                        Docs: {pet.registrationStatus.hasDocuments}/4
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredPets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No pets found</p>
          </div>
        )}
      </div>
    </div>
  );
}