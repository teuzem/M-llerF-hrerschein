import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { UploadCloud, File as FileIcon, X, Edit, FileType } from 'lucide-react';
import ImageCropModal from './ImageCropModal';

interface AdvancedDropzoneProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  label: string;
  maxFiles?: number;
}

const AdvancedDropzone: React.FC<AdvancedDropzoneProps> = ({ onFilesChange, files, label, maxFiles = 1 }) => {
  const { t } = useTranslation();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      console.error('File rejections:', fileRejections);
    }
    onFilesChange(acceptedFiles);
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    maxFiles,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
  });

  const removeFile = (fileToRemove: File) => {
    onFilesChange(files.filter(file => file !== fileToRemove));
  };

  const openCropModal = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile: File) => {
    // Replace the original file with the cropped one
    onFilesChange([croppedFile]);
  };

  const filePreviews = useMemo(() => files.map(file => ({
    file,
    preview: URL.createObjectURL(file)
  })), [files]);

  return (
    <div>
      {isCropModalOpen && imageToCrop && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}

      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-400'}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600">{t('application.form.dropzone_text')}</p>
            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>
      ) : (
        <aside className="mt-2">
          <ul className="space-y-2">
            {filePreviews.map(({ file, preview }) => (
              <li key={file.name} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {file.type.startsWith('image/') ? (
                    <img src={preview} alt={file.name} className="w-12 h-12 rounded-md object-cover" />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md">
                      <FileType className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.type.startsWith('image/') && (
                    <button
                      type="button"
                      onClick={() => openCropModal(file)}
                      className="p-2 rounded-full hover:bg-blue-100 text-german-red"
                      title={t('application.form.edit_image')}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                    title="Supprimer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
};

export default AdvancedDropzone;
