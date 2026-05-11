import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, FileText, Image as ImageIcon, File, Eye, Trash2, ChevronDown, CheckCircle2, AlertCircle, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react';

export interface UploadedDoc {
  file: File;
  type: string;
  preview: string | null;
  id: string;
}

interface DocumentDropzoneProps {
  documents: UploadedDoc[];
  setDocuments: React.Dispatch<React.SetStateAction<UploadedDoc[]>>;
}

const DOCUMENT_TYPES = [
  { value: 'id_passport', labelKey: 'order.doc_type.id_passport' },
  { value: 'photo', labelKey: 'order.doc_type.photo' },
  { value: 'signature', labelKey: 'order.doc_type.signature' },
  { value: 'proof_of_address', labelKey: 'order.doc_type.proof_of_address' },
  { value: 'medical_certificate', labelKey: 'order.doc_type.medical' },
  { value: 'other', labelKey: 'order.doc_type.other' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType === 'application/pdf') return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({ documents, setDocuments }) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState('id_passport');
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Advanced preview state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation(prev => prev + 90);
  };

  const resetPreviewState = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newErrors: string[] = [];

    rejectedFiles.forEach((f: any) => {
      if (f.errors?.some((e: any) => e.code === 'file-too-large')) {
        newErrors.push(`${f.file.name}: ${t('order.doc_error.too_large')}`);
      } else {
        newErrors.push(`${f.file.name}: ${t('order.doc_error.invalid')}`);
      }
    });

    const newDocs: UploadedDoc[] = acceptedFiles.map(file => {
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null;
      return {
        file,
        type: selectedType,
        preview,
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      };
    });

    setDocuments(prev => [...prev, ...newDocs]);
    setErrors(newErrors);
  }, [selectedType, setDocuments, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeDoc = (id: string) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id);
      if (doc?.preview) URL.revokeObjectURL(doc.preview);
      return prev.filter(d => d.id !== id);
    });
  };

  const changeDocType = (id: string, newType: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, type: newType } : d));
  };

  const currentTypeLabel = DOCUMENT_TYPES.find(dt => dt.value === selectedType);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {t('order.documents_label')}
      </label>

      {/* Document type selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setTypeOpen(!typeOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:border-german-red/40 transition-colors"
        >
          <span>{currentTypeLabel ? t(currentTypeLabel.labelKey) : selectedType}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {typeOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
            >
              {DOCUMENT_TYPES.map(dt => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => { setSelectedType(dt.value); setTypeOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${selectedType === dt.value ? 'bg-german-red/5 text-german-red font-semibold' : 'text-gray-700'}`}
                >
                  {selectedType === dt.value && <CheckCircle2 className="w-4 h-4" />}
                  {t(dt.labelKey)}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group ${
          isDragActive
            ? 'border-german-red bg-german-red/5 scale-[1.02]'
            : 'border-gray-200 bg-gray-50/50 hover:border-german-red/40 hover:bg-german-red/[0.02]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragActive
              ? 'bg-german-red text-white scale-110 rotate-6'
              : 'bg-german-red/10 text-german-red group-hover:scale-105'
          }`}>
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {isDragActive ? t('order.drop_files') : t('order.drag_files')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('order.accepted_formats')}
            </p>
            <p className="text-xs text-gray-400">
              {t('order.max_size')}
            </p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Document list */}
      <AnimatePresence>
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {documents.map((doc) => {
              const Icon = getFileIcon(doc.file.type);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group/item"
                >
                  {/* Preview thumbnail */}
                  <div
                    onClick={() => setPreviewDoc(doc)}
                    className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-german-red/30 transition-all"
                  >
                    {doc.preview ? (
                      <img src={doc.preview} alt={doc.file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{formatFileSize(doc.file.size)}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <select
                        value={doc.type}
                        onChange={(e) => changeDocType(doc.id, e.target.value)}
                        className="text-xs text-german-red bg-transparent border-none p-0 pr-5 cursor-pointer focus:ring-0 font-medium"
                      >
                        {DOCUMENT_TYPES.map(dt => (
                          <option key={dt.value} value={dt.value}>{t(dt.labelKey)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                      title={t('order.preview')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => {
              setPreviewDoc(null);
              resetPreviewState();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{previewDoc.file.name}</h3>
                  <p className="text-xs text-gray-400">{formatFileSize(previewDoc.file.size)} • {t(DOCUMENT_TYPES.find(d => d.value === previewDoc.type)?.labelKey || '')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {previewDoc.file.type.startsWith('image/') && (
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                      <button onClick={handleZoomOut} className="p-1.5 hover:bg-white rounded-md transition-colors" title="Zoom Out">
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="text-xs font-medium text-gray-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                      <button onClick={handleZoomIn} className="p-1.5 hover:bg-white rounded-md transition-colors" title="Zoom In">
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="w-px h-4 bg-gray-300 mx-1"></div>
                      <button onClick={handleRotate} className="p-1.5 hover:bg-white rounded-md transition-colors" title="Rotate">
                        <RotateCw className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setPreviewDoc(null);
                      resetPreviewState();
                    }}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-auto max-h-[calc(90vh-80px)] min-h-[50vh] flex items-center justify-center bg-gray-800/5 p-4 relative">
                {previewDoc.file.type.startsWith('image/') ? (
                  <motion.img
                    src={previewDoc.preview || URL.createObjectURL(previewDoc.file)}
                    alt={previewDoc.file.name}
                    animate={{ scale: zoomLevel, rotate: rotation }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg origin-center cursor-move"
                    drag
                    dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                  />
                ) : previewDoc.file.type === 'application/pdf' ? (
                  <iframe
                    src={URL.createObjectURL(previewDoc.file)}
                    className="w-full h-[70vh] rounded-lg border border-gray-200"
                    title={previewDoc.file.name}
                  />
                ) : (
                  <div className="text-center py-16">
                    <File className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">{t('order.preview_unavailable')}</p>
                    <p className="text-sm text-gray-400 mt-1">{previewDoc.file.name}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentDropzone;
