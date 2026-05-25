'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../components/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Dog, User, Calendar, Award, FileText, 
  CheckCircle, Clock, Loader2, Download, Send, Eye,
  Phone, Mail, MapPin, Syringe, Stethoscope
} from 'lucide-react';
import { api } from '../../../../lib/api';

interface PetDetail {
  pet: {
    _id: string;
    name: string;
    breed: string;
    ageYears: number;
    ageMonths: number;
    gender: string;
    color: string;
    microchip: string;
    registrationStage: number;
    registrationStatus: string;
    vaccinationCertificateNumber: string;
    vaccinationDate: string;
    vaccinationValidTill: string;
    vetName: string;
    vetMobile: string;
    owner: {
      _id: string;
      name: string;
      email: string;
      mobile: string;
    };
    createdAt: string;
    license?: {
      number: string;
      issuedAt: string;
      expiresAt: string;
      fileData: string;
    };
  };
  registration: {
    _id: string;
    documents: any[];
    registrationTriggered: boolean;
    registrationTriggeredAt: string;
  } | null;
}

export default function AdminPetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<PetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseData, setLicenseData] = useState({
    number: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    file: null as File | null
  });

  useEffect(() => {
    if (token && id) {
      fetchPetDetail();
    }
  }, [token, id]);

  const fetchPetDetail = async () => {
    try {
      const data = await api.admin.getPet(id as string);
      setData(data);
    } catch (error) {
      console.error('Error fetching pet details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (stage: number) => {
    setUpdatingStage(true);
    try {
      await api.admin.updateRegistrationStage(id as string, stage);
      await fetchPetDetail();
    } catch (error) {
      console.error('Error updating stage:', error);
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleIssueLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStage(true);
    
    try {
      let fileData = null;
      if (licenseData.file) {
        const reader = new FileReader();
        fileData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(licenseData.file as Blob);
        });
      }
      
      await api.admin.issueLicense(id as string, {
        licenseNumber: licenseData.number,
        issueDate: licenseData.issueDate,
        expiryDate: licenseData.expiryDate,
        licenseFile: fileData
      });
      
      setShowLicenseModal(false);
      setLicenseData({
        number: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        file: null
      });
      await fetchPetDetail();
    } catch (error) {
      console.error('Error issuing license:', error);
    } finally {
      setUpdatingStage(false);
    }
  };

  const downloadLicense = () => {
    if (data?.pet.license?.fileData) {
      const link = document.createElement('a');
      link.href = data.pet.license.fileData;
      link.download = `license_${data.pet.name}.pdf`;
      link.click();
    }
  };

  const getStageName = (stage: number) => {
    const stages = ['Not Started', 'Documents Ready', 'Form Submitted', 'Awaiting License', 'License Delivered'];
    return stages[stage];
  };

  const getStageColor = (stage: number) => {
    const colors = ['bg-gray-100 text-gray-700', 'bg-blue-100 text-blue-700', 'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700'];
    return colors[stage];
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
        <p className="text-gray-500">Pet not found</p>
      </div>
    );
  }

  const { pet, registration } = data;
  const isComplete = pet.registrationStage === 4;
  const canIssueLicense = pet.registrationStage === 3;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Pet Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <Dog className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-500">Pet ID: {pet._id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Breed</p>
              <p className="font-medium text-gray-900">{pet.breed || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium text-gray-900">{pet.ageYears} years {pet.ageMonths} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium text-gray-900 capitalize">{pet.gender || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Color</p>
              <p className="font-medium text-gray-900">{pet.color || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Microchip</p>
              <p className="font-medium text-gray-900">{pet.microchip || 'Not added'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">{new Date(pet.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Owner Info */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Owner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{pet.owner?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{pet.owner?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{pet.owner?.mobile || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vaccination Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Syringe className="w-5 h-5 text-orange-500" />
            Vaccination Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Certificate Number</p>
              <p className="font-medium text-gray-900">{pet.vaccinationCertificateNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vaccination Date</p>
              <p className="font-medium text-gray-900">{pet.vaccinationDate ? new Date(pet.vaccinationDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid Till</p>
              <p className="font-medium text-gray-900">{pet.vaccinationValidTill ? new Date(pet.vaccinationValidTill).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </motion.div>

        {/* Vet Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-orange-500" />
            Veterinary Doctor Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Doctor/Hospital Name</p>
              <p className="font-medium text-gray-900">{pet.vetName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile Number</p>
              <p className="font-medium text-gray-900">{pet.vetMobile || 'N/A'}</p>
            </div>
          </div>
        </motion.div>

        {/* Registration Progress & Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Registration Progress
          </h2>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Current Stage</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStageColor(pet.registrationStage)}`}>
                {getStageName(pet.registrationStage)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${(pet.registrationStage / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Documents Status */}
          {registration && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Documents Uploaded</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Anti-Rabies Certificate</span>
                  {registration.documents.some(d => d.documentName === 'antiRabiesCertificate') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">ID Proof</span>
                  {registration.documents.some(d => d.documentName === 'idProof') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Residence Proof</span>
                  {registration.documents.some(d => d.documentName === 'residenceProof') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Owner with Pet Photo</span>
                  {registration.documents.some(d => d.documentName === 'ownerWithPetPhoto') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {registration.documents.length}/4 documents uploaded
                {registration.registrationTriggered && ' • Registration submitted'}
              </p>
            </div>
          )}

          {/* Stage Update Buttons */}
          {!isComplete && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Update Registration Stage</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => updateStage(1)}
                  disabled={updatingStage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Mark Documents Ready
                </button>
                <button
                  onClick={() => updateStage(2)}
                  disabled={updatingStage}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  Mark Form Submitted
                </button>
                <button
                  onClick={() => updateStage(3)}
                  disabled={updatingStage}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  Mark Awaiting License
                </button>
                {canIssueLicense && (
                  <button
                    onClick={() => setShowLicenseModal(true)}
                    disabled={updatingStage}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    Issue License
                  </button>
                )}
              </div>
            </div>
          )}

          {/* License Display */}
          {isComplete && pet.license && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Award className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-green-800 font-medium">License Issued</p>
                  <p className="text-green-600 text-sm">Number: {pet.license.number}</p>
                  <p className="text-green-600 text-sm">Expires: {new Date(pet.license.expiresAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={downloadLicense}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download License
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* License Modal */}
        {showLicenseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Issue License</h2>
              <form onSubmit={handleIssueLicense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    required
                    value={licenseData.number}
                    onChange={(e) => setLicenseData({ ...licenseData, number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseData.issueDate}
                    onChange={(e) => setLicenseData({ ...licenseData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseData.expiryDate}
                    onChange={(e) => setLicenseData({ ...licenseData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Document (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setLicenseData({ ...licenseData, file: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLicenseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStage}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updatingStage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                    Issue License
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}