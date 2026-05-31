'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../components/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Dog, User, Calendar, Award, FileText,
  CheckCircle, Clock, Loader2, Download, Eye,
  Syringe, Stethoscope, ChevronRight, AlertTriangle
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
    paymentStatus: string;
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
    paymentStatus: string;
  } | null;
}

/* ─── Stage config ───────────────────────────────────────────────────────── */
const STAGES = [
  { stage: 0, label: 'Not Started',      desc: 'Pet added, no documents yet',              color: 'bg-gray-100 text-gray-700',    bar: 'bg-gray-400'   },
  { stage: 1, label: 'Docs Uploaded',    desc: 'All 4 documents uploaded',                 color: 'bg-blue-100 text-blue-700',    bar: 'bg-blue-500'   },
  { stage: 2, label: 'Form Submitted',   desc: 'Payment done, registration submitted',      color: 'bg-orange-100 text-orange-700',bar: 'bg-orange-500' },
  { stage: 3, label: 'Awaiting License', desc: 'Under review — license being prepared',    color: 'bg-purple-100 text-purple-700',bar: 'bg-purple-500' },
  { stage: 4, label: 'Registered ✓',     desc: 'License delivered — registration complete',color: 'bg-green-100 text-green-700',  bar: 'bg-green-500'  },
];

const DOC_LABELS: Record<string, string> = {
  antiRabiesCertificate: 'Anti-Rabies Certificate',
  idProof: 'ID Proof',
  residenceProof: 'Residence Proof',
  ownerWithPetPhoto: 'Owner with Pet Photo',
};

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
    file: null as File | null,
  });

  useEffect(() => {
    if (token && id) fetchPetDetail();
  }, [token, id]);

  const fetchPetDetail = async () => {
    try {
      const d = await api.admin.getPet(id as string);
      setData(d);
    } catch (err) {
      console.error('Error fetching pet details:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (stage: number) => {
    setUpdatingStage(true);
    try {
      await api.admin.updateRegistrationStage(id as string, stage);
      await fetchPetDetail();
    } catch (err) {
      console.error('Error updating stage:', err);
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
        fileData = await new Promise(resolve => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(licenseData.file as Blob);
        });
      }
      await api.admin.issueLicense(id as string, {
        licenseNumber: licenseData.number,
        issueDate: licenseData.issueDate,
        expiryDate: licenseData.expiryDate,
        licenseFile: fileData,
      });
      setShowLicenseModal(false);
      setLicenseData({ number: '', issueDate: new Date().toISOString().split('T')[0], expiryDate: '', file: null });
      await fetchPetDetail();
    } catch (err) {
      console.error('Error issuing license:', err);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Pet not found</p></div>;
  }

  const { pet, registration } = data;
  const currentStage = STAGES[pet.registrationStage] ?? STAGES[0];
  const isComplete = pet.registrationStage === 4;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>

        {/* Pet header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <Dog className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-500 text-sm">Pet ID: {pet._id}</p>
            </div>
            {/* Stage badge top-right */}
            <div className="ml-auto">
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${currentStage.color}`}>
                {currentStage.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              ['Breed', pet.breed], ['Age', `${pet.ageYears}y ${pet.ageMonths}m`],
              ['Gender', pet.gender], ['Color', pet.color],
              ['Microchip', pet.microchip || 'Not added'],
              ['Registered', new Date(pet.createdAt).toLocaleDateString()],
            ].map(([label, val]) => (
              <div key={label}><p className="text-gray-400">{label}</p><p className="font-medium text-gray-900">{val || 'N/A'}</p></div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />Owner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {[['Name', pet.owner?.name], ['Email', pet.owner?.email], ['Mobile', pet.owner?.mobile]].map(([l, v]) => (
                <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v || 'N/A'}</p></div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Vaccination */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Syringe className="w-5 h-5 text-orange-500" />Vaccination Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              ['Certificate No.', pet.vaccinationCertificateNumber],
              ['Date', pet.vaccinationDate ? new Date(pet.vaccinationDate).toLocaleDateString() : 'N/A'],
              ['Valid Till', pet.vaccinationValidTill ? new Date(pet.vaccinationValidTill).toLocaleDateString() : 'N/A'],
            ].map(([l, v]) => (
              <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v}</p></div>
            ))}
          </div>
        </motion.div>

        {/* Vet */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-orange-500" />Veterinary Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[['Doctor / Hospital', pet.vetName], ['Mobile', pet.vetMobile]].map(([l, v]) => (
              <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v || 'N/A'}</p></div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════
            REGISTRATION PROGRESS & ADMIN CONTROLS
        ══════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />Registration Progress & Controls
          </h2>

          {/* 5-step visual pipeline */}
          <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
            {STAGES.map((s, i) => {
              const isDone = pet.registrationStage > s.stage;
              const isCurrent = pet.registrationStage === s.stage;
              return (
                <div key={s.stage} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      isDone    ? 'bg-green-500 border-green-500 text-white' :
                      isCurrent ? `${s.bar} border-transparent text-white` :
                                  'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : s.stage}
                    </div>
                    <span className={`text-xs mt-1 text-center max-w-[72px] leading-tight ${
                      isCurrent ? 'font-semibold text-gray-900' : 'text-gray-400'
                    }`}>{s.label}</span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`h-0.5 w-10 md:w-16 mx-1 flex-shrink-0 rounded ${
                      pet.registrationStage > s.stage ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current stage description */}
          <div className={`px-4 py-3 rounded-xl mb-6 ${currentStage.color} bg-opacity-60`}>
            <p className="font-semibold text-sm">{currentStage.label}</p>
            <p className="text-xs mt-0.5 opacity-80">{currentStage.desc}</p>
          </div>

          {/* Payment status */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="text-gray-500">Payment:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              pet.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
              pet.paymentStatus === 'failed'    ? 'bg-red-100 text-red-700' :
                                                  'bg-gray-100 text-gray-600'
            }`}>
              {pet.paymentStatus === 'completed' ? '✓ Paid' :
               pet.paymentStatus === 'failed'    ? '✗ Failed' : 'Pending'}
            </span>
          </div>

          {/* Documents checklist */}
          {registration && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Documents — {registration.documents.length}/4 uploaded
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.keys(DOC_LABELS).map(docKey => {
                  const uploaded = registration.documents.some(d => d.documentName === docKey);
                  return (
                    <div key={docKey} className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                      uploaded ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
                    }`}>
                      <span className={uploaded ? 'text-gray-800' : 'text-gray-400'}>{DOC_LABELS[docKey]}</span>
                      {uploaded
                        ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ADMIN ACTION BUTTONS ── */}
          {!isComplete && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Admin Actions</h3>

              {/* Warning if docs not complete */}
              {(registration?.documents.length ?? 0) < 4 && pet.registrationStage < 2 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm mb-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Documents incomplete ({registration?.documents.length ?? 0}/4). Advance stage only if verified manually.
                </div>
              )}

              <div className="flex flex-wrap gap-3">

                {/* Only show stages ahead of current */}
                {pet.registrationStage < 3 && (
                  <button onClick={() => updateStage(3)} disabled={updatingStage}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium">
                    {updatingStage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    Mark Awaiting License
                  </button>
                )}

                {/* Issue License button — show from stage 2 onwards */}
                {pet.registrationStage >= 2 && (
                  <button onClick={() => setShowLicenseModal(true)} disabled={updatingStage}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium">
                    <Award className="w-4 h-4" />
                    Issue License & Mark Registered
                  </button>
                )}

                {/* Fallback: move back if needed */}
                {pet.registrationStage > 0 && (
                  <button onClick={() => updateStage(pet.registrationStage - 1)} disabled={updatingStage}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm">
                    ← Move Back
                  </button>
                )}
              </div>
            </div>
          )}

          {/* License delivered display */}
          {isComplete && pet.license && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-6 h-6 text-green-600" />
                    <p className="font-semibold text-green-800">License Issued & Delivered</p>
                  </div>
                  <p className="text-green-600 text-sm">Number: <strong>{pet.license.number}</strong></p>
                  <p className="text-green-600 text-sm">
                    Issued: {new Date(pet.license.issuedAt).toLocaleDateString()} ·
                    Expires: {new Date(pet.license.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                {pet.license.fileData && (
                  <button onClick={downloadLicense}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm">
                    <Download className="w-4 h-4" />Download License
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Registered but no license object */}
          {isComplete && !pet.license && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-800 text-sm font-medium">Pet is marked as registered.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── LICENSE MODAL ── */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Issue License</h2>
            <p className="text-sm text-gray-500 mb-5">
              This will mark <strong>{data?.pet.name}</strong> as fully registered (Stage 4) and notify the owner.
            </p>
            <form onSubmit={handleIssueLicense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                <input type="text" required value={licenseData.number}
                  onChange={e => setLicenseData({ ...licenseData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  placeholder="e.g. MCD-2026-00123" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                  <input type="date" required value={licenseData.issueDate}
                    onChange={e => setLicenseData({ ...licenseData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input type="date" required value={licenseData.expiryDate}
                    onChange={e => setLicenseData({ ...licenseData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License PDF (optional)</label>
                <input type="file" accept=".pdf"
                  onChange={e => setLicenseData({ ...licenseData, file: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLicenseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={updatingStage}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium">
                  {updatingStage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  Issue & Mark Registered
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}