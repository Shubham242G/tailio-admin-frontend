'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { motion } from 'framer-motion';
import {
  FileText, User, Dog, Loader2, Eye, Search,
  CheckCircle, Clock, Award, ChevronRight, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../lib/api';

interface Registration {
  _id: string;
  pet: {
    _id: string;
    name: string;
    registrationStage: number;
    registrationStatus: string;
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
  paymentStatus?: string;
}

/* ─── Stage config — single source of truth ─────────────────────────────── */
const STAGES = [
  { stage: 0, label: 'Not Started',      color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400'   },
  { stage: 1, label: 'Docs Uploaded',    color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'   },
  { stage: 2, label: 'Form Submitted',   color: 'bg-orange-100 text-orange-700',dot: 'bg-orange-500' },
  { stage: 3, label: 'Awaiting License', color: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500' },
  { stage: 4, label: 'Registered ✓',     color: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
];

function StageBadge({ stage }: { stage: number }) {
  const s = STAGES[stage] ?? STAGES[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

type FilterType = 'all' | '0' | '1' | '2' | '3' | '4';

export default function AdminRegistrations() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [advancing, setAdvancing] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchRegistrations();
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

  /* Advance a pet to the next stage directly from the list */
  const advanceStage = async (petId: string, currentStage: number) => {
    if (currentStage >= 4) return;
    setAdvancing(petId);
    try {
      await api.admin.updateRegistrationStage(petId, currentStage + 1);
      await fetchRegistrations();
    } catch (err) {
      console.error('Error advancing stage:', err);
    } finally {
      setAdvancing(null);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.pet?.name?.toLowerCase().includes(search.toLowerCase()) ||
      reg.pet?.owner?.name?.toLowerCase().includes(search.toLowerCase());

    const petStage = reg.pet?.registrationStage ?? 0;
    const matchesFilter =
      filter === 'all' ? true : petStage === parseInt(filter);

    return matchesSearch && matchesFilter;
  });

  /* Count per stage for the filter tabs */
  const countByStage = (stage: FilterType) =>
    stage === 'all'
      ? registrations.length
      : registrations.filter(r => (r.pet?.registrationStage ?? 0) === parseInt(stage)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
          <p className="text-gray-500 mt-1">Manage all registration applications across all 5 stages</p>
        </div>

        {/* Search + Stage filter tabs */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by pet or owner name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          {/* Stage filter tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', '0', '1', '2', '3', '4'] as FilterType[]).map(f => {
              const label = f === 'all' ? 'All' : STAGES[parseInt(f)].label;
              const count = countByStage(f);
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    filter === f
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Pet Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Docs</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stage</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Advance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, index) => {
                  const petStage = reg.pet?.registrationStage ?? 0;
                  const isAdvancing = advancing === reg.pet?._id;
                  const nextStageLabel = petStage < 4 ? STAGES[petStage + 1]?.label : null;

                  return (
                    <motion.tr
                      key={reg._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{reg.pet?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{reg.pet?.owner?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-semibold ${
                          reg.documents?.length === 4 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {reg.documents?.length || 0}/4
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <StageBadge stage={petStage} />
                      </td>
                      <td className="py-3 px-4">
                        {petStage < 4 ? (
                          <button
                            onClick={() => advanceStage(reg.pet?._id, petStage)}
                            disabled={isAdvancing}
                            title={`Advance to: ${nextStageLabel}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {isAdvancing
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <ChevronRight className="w-3 h-3" />}
                            {nextStageLabel}
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <Award className="w-3.5 h-3.5" />
                            Complete
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/admin/pets/${reg.pet?._id}`}
                          className="text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No registrations found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}