import React from 'react';
import { useTranslation } from 'react-i18next';
import { LicenseType } from '../../lib/supabase';
import Modal from '../ui/Modal';
import { Clock, Euro, FileText, CheckCircle } from 'lucide-react';

interface LicenseDetailModalProps {
  license: LicenseType | null;
  isOpen: boolean;
  onClose: () => void;
}

const LicenseDetailModal: React.FC<LicenseDetailModalProps> = ({ license, isOpen, onClose }) => {
  const { t, i18n } = useTranslation();

  if (!license) return null;

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const licenseName = (license as any)[`name_${currentLang}`] || license.name_de;
  const licenseDesc = (license as any)[`description_${currentLang}`] || license.description_de;

  const includedItems = [
    t('pricing.included.item1.title'),
    t('pricing.included.item2.title'),
    t('pricing.included.item3.title'),
    t('pricing.included.item4.title'),
  ];

  const requiredDocuments = [
    t('services.requirement1'),
    t('services.requirement2'),
    t('services.requirement3'),
    t('services.requirement4'),
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${t('common.details_for')} ${t('common.application')} ${license.category}`}
    >
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-bold text-gray-800">{licenseName}</h4>
          <p className="text-gray-600">{licenseDesc}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Euro className="w-6 h-6 text-german-red" />
            <div>
              <p className="text-sm text-gray-500">{t('pricing.calculator.base_price')}</p>
              <p className="text-lg font-bold text-gray-800">{license.price_gross_euros}€</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
            <Clock className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">{t('services.processing_time')}</p>
              <p className="text-lg font-bold text-gray-800">{license.processing_days} {t('services.days')}</p>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-bold text-gray-800 mb-2">{t('pricing.included.title')}</h5>
          <ul className="space-y-2">
            {includedItems.map((item, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-gray-800 mb-2">{t('services.requirements_title')}</h5>
          <ul className="space-y-2">
            {requiredDocuments.map((doc, index) => (
              <li key={index} className="flex items-center">
                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-700">{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default LicenseDetailModal;
