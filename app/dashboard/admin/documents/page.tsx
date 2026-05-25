'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { motion } from 'framer-motion';
import { FileText, User, Dog, Loader2, Eye, CheckCircle, Clock, Download } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../lib/api';

interface PendingDocument {
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
  missingDocuments: string[];
  uploadedDocumentsCount: number;
}

export default function AdminDocuments() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchPendingDocuments();
    }
  }, [token]);

  const fetchPendingDocuments = async () => {
    try {
      const data = await api.admin.getPendingDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentLabel = (docName: string) => {
    const labels: Record<string, string> = {
      antiRabiesCertificate: 'Anti-Rabies Certificate',
      idProof: 'ID Proof',
      residenceProof: 'Residence Proof',
      ownerWithPetPhoto: 'Owner with Pet Photo'
    };
    return labels[docName] || docName;
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Pending Documents</h1>
          <p className="text-gray-500 mt-1">Review documents that need to be uploaded</p>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 gap-6">
          {documents.map((doc, index) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Dog className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{doc.pet?.name}</h3>
                    <p className="text-sm text-gray-500">Owner: {doc.pet?.owner?.name}</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/admin/pets/${doc.pet?._id}`}
                  className="text-orange-500 hover:text-orange-600"
                >
                  <Eye className="w-5 h-5" />
                </Link>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Document Progress</span>
                  <span className="font-medium">{doc.uploadedDocumentsCount}/4 uploaded</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(doc.uploadedDocumentsCount / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Missing Documents:</h4>
                <div className="flex flex-wrap gap-2">
                  {doc.missingDocuments.map((missingDoc) => (
                    <span
                      key={missingDoc}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full"
                    >
                      <Clock className="w-3 h-3" />
                      {getDocumentLabel(missingDoc)}
                    </span>
                  ))}
                </div>
              </div>

              {doc.uploadedDocumentsCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Uploaded Documents:</h4>
                  <div className="flex flex-wrap gap-2">
                    {doc.documents.map((uploadedDoc) => (
                      <span
                        key={uploadedDoc.documentName}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 text-sm rounded-full"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {getDocumentLabel(uploadedDoc.documentName)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-green-50 inline-flex p-4 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Documents Complete!</h3>
            <p className="text-gray-500">All pets have all required documents uploaded.</p>
          </div>
        )}
      </div>
    </div>
  );
}