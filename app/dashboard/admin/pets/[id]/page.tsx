'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../components/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Dog, User, Calendar, Award, FileText,
  CheckCircle, Clock, Loader2, Download, Eye,
  Syringe, Stethoscope, ChevronRight, AlertTriangle,
  MapPin, CreditCard, Tag, FileCheck, Image as ImageIcon,
  File, X, ZoomIn, Phone, Mail, Home, Scissors,
  Package, Truck, Building2, Hash, Shield
} from 'lucide-react';
import { api } from '../../../../lib/api';

// ✅ Define document type
interface DocumentType {
  documentName: string;
  fileName: string;
  fileSize: number;
  fileData: string;
  mimeType: string;
  uploadedAt: string;
}

// ✅ Define pet document field type
interface PetDocumentField {
  fileData: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface PetDetail {
  pet: {
    _id: string;
    name: string;
    species: string;
    breed: string;
    ageYears: number;
    ageMonths: number;
    gender: string;
    color: string;
    microchip: string;
    city: string;
    registrationStage: number;
    registrationStatus: string;
    paymentStatus: string;
    paymentAmount: number;
    paymentId: string;
    paymentOrderId: string;
    vaccinationCertificateNumber: string;
    vaccinationDate: string;
    vaccinationValidTill: string;
    vetName: string;
    vetMobile: string;
    profilePicture: string;
    tagDelivery: {
      option: string;
      cost: number;
    };
    license: {
      number: string;
      issuedAt: string;
      expiresAt: string;
      fileData: string;
    };
    owner: {
      _id: string;
      name: string;
      email: string;
      mobile: string;
      whatsappNumber: string;
      city: string;
    };
    createdAt: string;
    updatedAt: string;
    uploadedDocumentsCount: number;
    requiredDocumentsCount: number;
    hasAllDocuments: boolean;
    isSterilizationRequired: boolean;
    isTagDeliveryAvailable: boolean;
    registrationTriggered: boolean;
    registrationTriggeredAt: string;
    // ✅ Document fields with proper typing
    antiRabiesCertificate?: PetDocumentField;
    idProof?: PetDocumentField;
    residenceProof?: PetDocumentField;
    ownerWithPetPhoto?: PetDocumentField;
    sterilizationCertificate?: PetDocumentField;
  };
  registration: {
    _id: string;
    documents: DocumentType[];
    registrationTriggered: boolean;
    registrationTriggeredAt: string;
    isComplete: boolean;
    paymentStatus: string;
    paymentId: string;
    paymentOrderId: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

/* ─── Stage config ───────────────────────────────────────────────────────── */
const STAGES = [
  { stage: 0, label: 'Not Started',      desc: 'Pet added, no documents yet',              color: 'bg-gray-100 text-gray-700',    bar: 'bg-gray-400'   },
  { stage: 1, label: 'Docs Uploaded',    desc: 'All documents uploaded',                    color: 'bg-blue-100 text-blue-700',    bar: 'bg-blue-500'   },
  { stage: 2, label: 'Form Submitted',   desc: 'Payment done, registration submitted',      color: 'bg-orange-100 text-orange-700',bar: 'bg-orange-500' },
  { stage: 3, label: 'Awaiting License', desc: 'Under review — license being prepared',    color: 'bg-purple-100 text-purple-700',bar: 'bg-purple-500' },
  { stage: 4, label: 'Registered ✓',     desc: 'License delivered — registration complete',color: 'bg-green-100 text-green-700',  bar: 'bg-green-500'  },
];

const DOC_LABELS: Record<string, string> = {
  antiRabiesCertificate: 'Anti-Rabies Certificate',
  idProof: 'ID Proof',
  residenceProof: 'Residence Proof',
  ownerWithPetPhoto: 'Owner with Pet Photo',
  sterilizationCertificate: 'Sterilization Certificate',
};

const DOC_ICONS: Record<string, any> = {
  antiRabiesCertificate: Syringe,
  idProof: Shield,
  residenceProof: Home,
  ownerWithPetPhoto: ImageIcon,
  sterilizationCertificate: Scissors,
};

const CITY_LABELS: Record<string, string> = {
  ghaziabad: 'Ghaziabad',
  delhi: 'Delhi',
  noida: 'Noida',
  gurgaon: 'Gurgaon',
  faridabad: 'Faridabad',
  other: 'Other',
};

// ✅ Type guard to check if a value is a PetDocumentField
function isPetDocumentField(value: any): value is PetDocumentField {
  return value && 
         typeof value === 'object' && 
         'fileData' in value && 
         typeof value.fileData === 'string' &&
         value.fileData.length > 0;
}

export default function AdminPetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<PetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
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
      link.download = `license_${data.pet.name}_${data.pet.license.number}.pdf`;
      link.click();
    }
  };

  // ✅ Get documents from registration or pet
  const getAllDocuments = (): DocumentType[] => {
    const docs: DocumentType[] = [];
    const pet = data?.pet;
    const registration = data?.registration;
    
    // First check registration.documents (from RegistrationForm)
    if (registration?.documents && registration.documents.length > 0) {
      docs.push(...registration.documents);
    }
    
    // Also check individual document fields on pet (for backward compatibility)
    if (pet) {
      const docFields = [
        { key: 'antiRabiesCertificate' as const, name: 'antiRabiesCertificate' },
        { key: 'idProof' as const, name: 'idProof' },
        { key: 'residenceProof' as const, name: 'residenceProof' },
        { key: 'ownerWithPetPhoto' as const, name: 'ownerWithPetPhoto' },
        { key: 'sterilizationCertificate' as const, name: 'sterilizationCertificate' },
      ];

      for (const field of docFields) {
        const docData = pet[field.key];
        // ✅ Use type guard to check if this is a valid document field
        if (isPetDocumentField(docData)) {
          // Check if this document is already in the documents array
          const exists = docs.some(d => d.documentName === field.name);
          if (!exists) {
            docs.push({
              documentName: field.name,
              fileName: docData.fileName || `${field.name}.pdf`,
              fileSize: docData.fileSize || 0,
              fileData: docData.fileData,
              mimeType: docData.mimeType || 'application/pdf',
              uploadedAt: docData.uploadedAt || new Date().toISOString(),
            });
          }
        }
      }
    }
    
    return docs;
  };

  // ✅ Get document count from registration
  const getDocumentCount = (): number => {
    const docs = getAllDocuments();
    return docs.length;
  };

  // ✅ Check if all required documents are uploaded
  const hasAllRequiredDocs = (): boolean => {
    const docs = getAllDocuments();
    const docNames = docs.map(d => d.documentName);
    const required = ['antiRabiesCertificate', 'idProof', 'residenceProof', 'ownerWithPetPhoto'];
    if (data?.pet?.isSterilizationRequired) {
      required.push('sterilizationCertificate');
    }
    return required.every(docName => docNames.includes(docName));
  };

  // ✅ Get required docs count
  const getRequiredDocsCount = (): number => {
    let count = 4;
    if (data?.pet?.isSterilizationRequired) {
      count = 5;
    }
    return count;
  };

  const downloadDocument = (doc: DocumentType) => {
    if (doc.fileData) {
      try {
        // Handle both Base64 with and without data URL prefix
        let fileData = doc.fileData;
        if (!fileData.startsWith('data:')) {
          const mimeType = doc.mimeType || 'application/pdf';
          fileData = `data:${mimeType};base64,${fileData}`;
        }
        
        const link = document.createElement('a');
        link.href = fileData;
        const extension = doc.mimeType?.includes('pdf') ? '.pdf' : 
                         doc.mimeType?.includes('image') ? '.' + doc.mimeType.split('/')[1] : 
                         doc.mimeType?.includes('jpeg') ? '.jpg' : '';
        const fileName = `${doc.documentName}_${data?.pet.name || 'pet'}${extension}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading document:', error);
        alert('Failed to download document. Please try again.');
      }
    } else {
      alert('No document data available to download.');
    }
  };

  const viewDocument = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setShowDocModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ✅ Get sterilization status
  const getSterilizationStatus = () => {
    const docs = getAllDocuments();
    const doc = docs.find(d => d.documentName === 'sterilizationCertificate');
    if (doc?.fileData) {
      return { uploaded: true, fileData: doc.fileData };
    }
    return { uploaded: false, fileData: null };
  };

  const allDocs = getAllDocuments();
  const docCount = allDocs.length;
  const requiredDocs = getRequiredDocsCount();
  const hasAllDocs = hasAllRequiredDocs();
  const sterilization = getSterilizationStatus();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Pet not found</p></div>;
  }

  const { pet, registration } = data;
  const currentStage = STAGES[pet.registrationStage] ?? STAGES[0];
  const isComplete = pet.registrationStage === 4;

  // Registration payment status from registration model
  const regPaymentStatus = registration?.paymentStatus || pet.paymentStatus || 'pending';
  const regPaymentId = registration?.paymentId || pet.paymentId || 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── LEFT COLUMN: Pet Info ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pet header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center overflow-hidden">
                  {pet.profilePicture ? (
                    <img src={pet.profilePicture} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <Dog className="w-8 h-8 text-orange-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
                  <p className="text-gray-500 text-sm">Pet ID: {pet._id.slice(-8)}</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${currentStage.color}`}>
                    {currentStage.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {[
                  ['Species', pet.species || 'Dog'],
                  ['Breed', pet.breed || 'Mixed'],
                  ['Age', `${pet.ageYears}y ${pet.ageMonths}m`],
                  ['Gender', pet.gender || 'Unknown'],
                  ['Color', pet.color || 'N/A'],
                  ['Microchip', pet.microchip || 'Not added'],
                  ['City', CITY_LABELS[pet.city] || pet.city],
                  ['Registered', formatDate(pet.createdAt)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
                    <p className="font-medium text-gray-900">{val || 'N/A'}</p>
                  </div>
                ))}
              </div>

              {/* Owner Info */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />Owner Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {[
                    ['Name', pet.owner?.name],
                    ['Email', pet.owner?.email],
                    ['Mobile', pet.owner?.mobile],
                    ['WhatsApp', pet.owner?.whatsappNumber],
                    ['City', pet.owner?.city ? CITY_LABELS[pet.owner.city] : 'N/A'],
                    ['Owner Since', formatDate(pet.createdAt)],
                  ].map(([l, v]) => (
                    <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v || 'N/A'}</p></div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Vaccination Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Syringe className="w-5 h-5 text-orange-500" />Vaccination Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {[
                  ['Certificate No.', pet.vaccinationCertificateNumber],
                  ['Date', pet.vaccinationDate ? formatDate(pet.vaccinationDate) : 'N/A'],
                  ['Valid Till', pet.vaccinationValidTill ? formatDate(pet.vaccinationValidTill) : 'N/A'],
                ].map(([l, v]) => (
                  <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v || 'N/A'}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-gray-100">
                {[
                  ['Vet / Hospital', pet.vetName],
                  ['Vet Mobile', pet.vetMobile],
                ].map(([l, v]) => (
                  <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v || 'N/A'}</p></div>
                ))}
              </div>
            </motion.div>

            {/* Tag Delivery */}
            {pet.isTagDeliveryAvailable && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />Tag Delivery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    ['Delivery Option', pet.tagDelivery?.option === 'deliver_to_home' ? 'Deliver to Home' : 'Collect from Municipal Office'],
                    ['Delivery Cost', pet.tagDelivery?.cost ? `₹${pet.tagDelivery.cost}` : 'Free'],
                  ].map(([l, v]) => (
                    <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v || 'N/A'}</p></div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Payment Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {[
                  ['Payment Status', regPaymentStatus === 'completed' ? '✅ Completed' : regPaymentStatus === 'failed' ? '❌ Failed' : '⏳ Pending'],
                  ['Payment Amount', pet.paymentAmount ? `₹${pet.paymentAmount}` : 'N/A'],
                  ['Payment ID', regPaymentId],
                ].map(([l, v]) => (
                  <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-gray-100">
                {[
                  ['Registration Status', pet.registrationStatus?.replace(/_/g, ' ') || 'N/A'],
                  ['Registration Triggered', pet.registrationTriggered ? formatDate(pet.registrationTriggeredAt) : 'Not yet'],
                ].map(([l, v]) => (
                  <div key={l}><p className="text-gray-400">{l}</p><p className="font-medium text-gray-900">{v || 'N/A'}</p></div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN: Documents & Controls ─── */}
          <div className="space-y-6">

            {/* Documents Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Documents ({docCount}/{requiredDocs})
              </h2>

              {allDocs && allDocs.length > 0 ? (
                <div className="space-y-3">
                  {allDocs.map((doc, index) => {
                    const Icon = DOC_ICONS[doc.documentName] || FileText;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {DOC_LABELS[doc.documentName] || doc.documentName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{doc.fileName}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>{formatDate(doc.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => viewDocument(doc)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No documents uploaded yet</p>
                </div>
              )}

              {/* Document Status Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Document Status</span>
                  <span className={`font-semibold ${hasAllDocs ? 'text-green-600' : 'text-orange-600'}`}>
                    {hasAllDocs ? '✅ All uploaded' : `${docCount}/${requiredDocs} uploaded`}
                  </span>
                </div>
                {pet.isSterilizationRequired && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Sterilization Required</span>
                    <span className={`font-semibold ${sterilization.uploaded ? 'text-green-600' : 'text-red-600'}`}>
                      {sterilization.uploaded ? '✅ Uploaded' : '⚠️ Required'}
                    </span>
                  </div>
                )}
                {registration && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Registration Created</span>
                    <span className="font-medium text-gray-900">{formatDate(registration.createdAt)}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Registration Controls Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />Registration Controls
              </h2>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full transition-all ${currentStage.bar}`} style={{ width: `${(pet.registrationStage / 4) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{currentStage.desc}</p>
              </div>

              {/* Registration Info */}
              {registration && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-600">Registration ID: <span className="font-mono text-gray-900">{registration._id.slice(-8)}</span></p>
                  <p className="text-gray-600 mt-1">Registration: {registration.isComplete ? '✅ Complete' : '⏳ In Progress'}</p>
                </div>
              )}

              {/* Admin Actions */}
              {!isComplete ? (
                <div className="space-y-3">
                  {!hasAllDocs && pet.registrationStage < 2 && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      Documents incomplete ({docCount}/{requiredDocs}). Verify manually before advancing.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {pet.registrationStage < 3 && (
                      <button
                        onClick={() => updateStage(3)}
                        disabled={updatingStage}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                      >
                        {updatingStage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                        Mark Awaiting License
                      </button>
                    )}

                    {pet.registrationStage >= 2 && (
                      <button
                        onClick={() => setShowLicenseModal(true)}
                        disabled={updatingStage}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Award className="w-4 h-4" />
                        Issue License
                      </button>
                    )}

                    {pet.registrationStage > 0 && (
                      <button
                        onClick={() => updateStage(pet.registrationStage - 1)}
                        disabled={updatingStage}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        ← Move Back
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="font-semibold text-green-800">Fully Registered</p>
                  </div>
                  {pet.license && (
                    <div className="space-y-2 text-sm">
                      <p className="text-green-700">License: <strong>{pet.license.number}</strong></p>
                      <p className="text-green-600 text-xs">
                        Issued: {formatDate(pet.license.issuedAt)} · Expires: {formatDate(pet.license.expiresAt)}
                      </p>
                      {pet.license.fileData && (
                        <button
                          onClick={downloadLicense}
                          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Download className="w-4 h-4" />Download License
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── DOCUMENT VIEW MODAL ─── */}
      {showDocModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-bold text-gray-900">{DOC_LABELS[selectedDoc.documentName] || selectedDoc.documentName}</h3>
                  <p className="text-xs text-gray-500">{selectedDoc.fileName} • {formatFileSize(selectedDoc.fileSize)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadDocument(selectedDoc)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDocModal(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh] bg-gray-50">
              {selectedDoc.mimeType?.includes('image') ? (
                <img
                  src={selectedDoc.fileData}
                  alt={selectedDoc.documentName}
                  className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                />
              ) : selectedDoc.mimeType?.includes('pdf') ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <File className="w-16 h-16 text-red-500 mb-4" />
                  <p className="text-gray-600 mb-2">PDF Document</p>
                  <p className="text-sm text-gray-400">{selectedDoc.fileName}</p>
                  <button
                    onClick={() => downloadDocument(selectedDoc)}
                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <File className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">{selectedDoc.fileName}</p>
                  <button
                    onClick={() => downloadDocument(selectedDoc)}
                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── LICENSE MODAL ─── */}
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
                <input
                  type="text"
                  required
                  value={licenseData.number}
                  onChange={e => setLicenseData({ ...licenseData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  placeholder="e.g. MCD-2026-00123"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseData.issueDate}
                    onChange={e => setLicenseData({ ...licenseData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseData.expiryDate}
                    onChange={e => setLicenseData({ ...licenseData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License PDF (optional)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setLicenseData({ ...licenseData, file: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLicenseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStage}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
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