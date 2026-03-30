import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { GalleryMedia } from '../../../lib/supabase';
import { Trash2 } from 'lucide-react';

interface EditUserMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: GalleryMedia | null;
  onUpdate: () => void;
}

const EditUserMediaModal: React.FC<EditUserMediaModalProps> = ({ isOpen, onClose, media, onUpdate }) => {
  const { t } = useTranslation();

  if (!media) return null;

  // Since users can't change status, this modal is simplified.
  // We can add description editing here in the future if needed.
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('dashboard.media.edit')}>
      <div className="space-y-4">
        <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
          {media.media_type === 'image' ? (
            <img src={media.media_url} alt="Media" className="w-full h-full object-cover" />
          ) : (
            <video src={media.media_url} controls className="w-full h-full" />
          )}
        </div>
        <p className="text-sm text-gray-600">
          Gestion des médias en cours de développement. Pour le moment, vous ne pouvez que supprimer vos médias.
        </p>
        <div className="flex justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditUserMediaModal;
