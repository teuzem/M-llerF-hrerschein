import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../ui/Modal';
import TestimonialForm from '../../testimonials/TestimonialForm';
import { Testimonial, LicenseType, supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../ui/LoadingSpinner';

interface EditTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: Testimonial | null;
  onUpdate: () => void;
}

const EditTestimonialModal: React.FC<EditTestimonialModalProps> = ({ isOpen, onClose, testimonial, onUpdate }) => {
  const { t } = useTranslation();
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLicenseTypes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('license_types').select('*').eq('is_active', true);
        if (error) throw error;
        setLicenseTypes(data || []);
      } catch (error) {
        toast.error('Fehler beim Laden der Führerscheinklassen.');
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchLicenseTypes();
    }
  }, [isOpen]);

  const handleFormSubmit = () => {
    onUpdate();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('dashboard.testimonials.edit_modal_title')}>
      {loading ? (
        <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
      ) : (
        <TestimonialForm
          onFormSubmit={handleFormSubmit}
          licenseTypes={licenseTypes}
          existingTestimonial={testimonial}
        />
      )}
    </Modal>
  );
};

export default EditTestimonialModal;
