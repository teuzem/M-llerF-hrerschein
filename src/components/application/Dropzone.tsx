import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  files: File[];
  label: string;
  maxFiles?: number;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDrop, files, label, maxFiles = 1 }) => {
  const { t } = useTranslation();

  const handleDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      // Handle rejections (e.g., file too large, wrong type)
      console.error('File rejections:', fileRejections);
    }
    onDrop(acceptedFiles);
  }, [onDrop]);

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
    const newFiles = files.filter(file => file !== fileToRemove);
    onDrop(newFiles);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
      {files.length > 0 && (
        <aside className="mt-4">
          <ul className="space-y-2">
            {files.map(file => (
              <li key={file.name} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                <div className="flex items-center">
                  <FileIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-800">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="p-1 rounded-full hover:bg-red-100 text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
};

export default Dropzone;
