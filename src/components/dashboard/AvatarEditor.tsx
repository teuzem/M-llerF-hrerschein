import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { User, UploadCloud, Edit2 } from 'lucide-react';
import ImageEditorModal from '../testimonials/ImageEditorModal'; // Reusing the powerful editor

interface AvatarEditorProps {
  currentAvatarUrl: string | null;
  onAvatarChange: (file: File) => void;
  uploading: boolean;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({ currentAvatarUrl, onAvatarChange, uploading }) => {
  const { t } = useTranslation();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToEdit(reader.result as string);
        setIsEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'image/*': ['.jpeg', '.png', '.webp'] },
  });

  const handleSave = (editedFile: File) => {
    onAvatarChange(editedFile);
    setIsEditorOpen(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {imageToEdit && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          imageSrc={imageToEdit}
          onSave={handleSave}
        />
      )}
      <div {...getRootProps()} className="relative w-32 h-32 cursor-pointer group">
        <input {...getInputProps()} />
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover shadow-md" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-300">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
            {uploading ? <div/> : <><Edit2 className="w-6 h-6 mx-auto" /><p className="text-xs mt-1">{t('dashboard.profile.avatar.change')}</p></>}
          </div>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarEditor;
