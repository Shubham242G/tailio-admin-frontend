'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../components/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Dog, 
  FileText, Award, Clock, Loader2, CheckCircle, XCircle,
  MapPin, CreditCard, AlertCircle, FileCheck, Eye,
  Shield, Users, Building2, Hash, Edit, Trash2,
  MessageCircle, Check, X, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../../lib/api';

interface CustomerDetail {
  customer: {
    _id: string;
    name: string;
    email: string;
    username: string;
    mobile: string;
    whatsappNumber: string;
    role: string;
    city: string;
    pricingTier: string;
    registrationFee: number;
    isVerified: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    whatsappOptIn: boolean;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    } | null;
  };
  pets: Array<{
    _id: string;
    name: string;
    breed: string;
    ageYears: number;
    ageMonths: number;
    gender: string;
    color: string;
    registrationStage: number;
    registrationStatus: string;
    profilePicture?: string;
    createdAt: string;
  }>;
  registrations: Array<{
    _id: string;
    pet: {
      _id: string;
      name: string;
    };
    documents: Array<{
      documentName: string;
      fileName: string;
      uploadedAt: string;
    }>;
    registrationTriggered: boolean;
    registrationTriggeredAt: string;
    createdAt: string;
    isComplete: boolean;
  }>;
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pets' | 'registrations' | 'documents'>('pets');

  useEffect(() => {
    if (token && id) {
      fetchCustomerDetail();
    }
  }, [token, id]);

  const fetchCustomerDetail = async () => {
    try {
      const data = await api.admin.getCustomer(id as string);
      setData(data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadge = (stage: number) => {
    const stages = [
      { label: 'Not Started', color: 'bg-gray-100 text-gray-700', icon: Clock },
      { label: 'Documents Ready', color: 'bg-blue-100 text-blue-700', icon: FileCheck },
      { label: 'Form Submitted', color: 'bg-orange-100 text-orange-700', icon: FileText },
      { label: 'Awaiting License', color: 'bg-purple-100 text-purple-700', icon: Clock },
      { label: 'Complete', color: 'bg-green-100 text-green-700', icon: Award }
    ];
    return stages[stage] || stages[0];
  };

  const getDocumentLabel = (docName: string) => {
    const labels: Record<string, string> = {
      antiRabiesCertificate: 'Anti-Rabies Certificate',
      idProof: 'ID Proof',
      residenceProof: 'Residence Proof',
      ownerWithPetPhoto: 'Owner with Pet Photo',
      sterilizationCertificate: 'Sterilization Certificate'
    };
    return labels[docName] || docName;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { color: string; icon: any }> = {
      admin: { color: 'bg-purple-100 text-purple-700', icon: Shield },
      salesman: { color: 'bg-blue-100 text-blue-700', icon: Users },
      user: { color: 'bg-green-100 text-green-700', icon: User }
    };
    return roles[role] || roles.user;
  };

  const getCityLabel = (city: string) => {
    const cities: Record<string, string> = {
      ghaziabad: 'Ghaziabad',
      delhi: 'Delhi',
      noida: 'Noida',
      gurgaon: 'Gurgaon',
      faridabad: 'Faridabad',
      other: 'Other'
    };
    return cities[city] || city;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
          <p className="text-gray-500 mb-6">The customer you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { customer, pets, registrations } = data;
  const roleInfo = getRoleBadge(customer.role);
  const RoleIcon = roleInfo.icon;

  const stats = {
    totalPets: pets.length,
    registeredPets: pets.filter(p => p.registrationStage === 4).length,
    inProgressPets: pets.filter(p => p.registrationStage > 0 && p.registrationStage < 4).length,
    pendingPets: pets.filter(p => p.registrationStage === 0).length,
    totalRegistrations: registrations.length,
    completedRegistrations: registrations.filter(r => r.registrationTriggered).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Customers</span>
        </button>

        {/* Customer Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer.name || customer.username || 'Unnamed User'}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {customer.role || 'User'}
                  </span>
                  {customer.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                      <X className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                  {customer.whatsappOptIn && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp Opted In
                    </span>
                  )}
                  <span className="text-sm text-gray-400">ID: {customer._id.slice(-8)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {customer.email && (
                <button
                  onClick={() => window.location.href = `mailto:${customer.email}`}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
              )}
              {(customer.mobile || customer.whatsappNumber) && (
                <button
                  onClick={() => window.location.href = `tel:${customer.mobile || customer.whatsappNumber}`}
                  className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
              )}
            </div>
          </div>

          {/* Customer Info Grid - All User Model Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-gray-900">{customer.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Mobile</p>
                <p className="font-medium text-gray-900">{customer.mobile || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">WhatsApp</p>
                <p className="font-medium text-gray-900">{customer.whatsappNumber || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Member Since</p>
                <p className="font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">City</p>
                <p className="font-medium text-gray-900">{getCityLabel(customer.city)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Registration Fee</p>
                <p className="font-medium text-gray-900">₹{customer.registrationFee || 999}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Building2 className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Pricing Tier</p>
                <p className="font-medium text-gray-900 capitalize">{customer.pricingTier || 'Standard'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Last Login</p>
                <p className="font-medium text-gray-900">{customer.lastLoginAt ? formatDate(customer.lastLoginAt) : 'Never'}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(customer.createdBy || customer.username) && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.username && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Hash className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-400">Username</p>
                    <p className="font-medium text-gray-900">{customer.username}</p>
                  </div>
                </div>
              )}
              {customer.createdBy && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-400">Created By</p>
                    <p className="font-medium text-gray-900">
                      {customer.createdBy.name || customer.createdBy.email || 'System'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Pets</p>
                <p className="text-2xl font-bold">{stats.totalPets}</p>
              </div>
              <Dog className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Registered Pets</p>
                <p className="text-2xl font-bold">{stats.registeredPets}</p>
              </div>
              <Award className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgressPets}</p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Not Started</p>
                <p className="text-2xl font-bold">{stats.pendingPets}</p>
              </div>
              <AlertCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pets')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pets'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Dog className="w-4 h-4 inline mr-2" />
            Pets ({stats.totalPets})
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'registrations'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Registrations ({stats.totalRegistrations})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileCheck className="w-4 h-4 inline mr-2" />
            Documents
          </button>
        </div>

        {/* Pets Tab */}
        {activeTab === 'pets' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pets.map((pet, index) => {
              const stage = getStageBadge(pet.registrationStage);
              const StageIcon = stage.icon;
              return (
                <Link
                  key={pet._id}
                  href={`/dashboard/admin/pets/${pet._id}`}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {pet.profilePicture ? (
                        <img src={pet.profilePicture} alt={pet.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                          <Dog className="w-6 h-6 text-orange-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-500">{pet.breed || 'Mixed Breed'}</p>
                      </div>
                    </div>
                    <StageIcon className={`w-5 h-5 ${stage.color.split(' ')[1]}`} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age:</span>
                      <span className="font-medium text-gray-900">
                        {pet.ageYears} years {pet.ageMonths} months
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-medium text-gray-900 capitalize">{pet.gender || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Color:</span>
                      <span className="font-medium text-gray-900">{pet.color || 'Not specified'}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${stage.color}`}>
                        <StageIcon className="w-3 h-3" />
                        {stage.label}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {pets.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl">
                <Dog className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pets registered yet</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Pet Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Documents</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Submitted Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg._id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{reg.pet?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">
                          {reg.documents?.length || 0}/4
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {formatDate(reg.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          reg.registrationTriggered 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {reg.registrationTriggered ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {registrations.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No registration applications found</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {registrations.map((reg) => (
              <div key={reg._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Documents for {reg.pet?.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    reg.registrationTriggered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {reg.documents?.length || 0}/4 Uploaded
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['antiRabiesCertificate', 'idProof', 'residenceProof', 'ownerWithPetPhoto', 'sterilizationCertificate'].map((docType) => {
                    const uploaded = reg.documents?.some(d => d.documentName === docType);
                    const doc = reg.documents?.find(d => d.documentName === docType);
                    return (
                      <div
                        key={docType}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          uploaded ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {uploaded ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-sm ${uploaded ? 'text-gray-900' : 'text-gray-500'}`}>
                            {getDocumentLabel(docType)}
                          </span>
                        </div>
                        {uploaded && doc && (
                          <span className="text-xs text-gray-400">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {reg.registrationTriggered && reg.registrationTriggeredAt && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Registration submitted on {formatDate(reg.registrationTriggeredAt)}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {registrations.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No documents uploaded yet</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}