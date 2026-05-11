import React from 'react';
import { useTranslation } from 'react-i18next';
import { LicenseType } from '../../lib/supabase';
import Modal from '../ui/Modal';
import { Clock, Euro, FileText, CheckCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

interface LicenseDetailModalProps {
  license: LicenseType | null;
  isOpen: boolean;
  onClose: () => void;
}

const LicenseDetailModal: React.FC<LicenseDetailModalProps> = ({ license, isOpen, onClose }) => {
  const { t, i18n } = useTranslation();

  if (!license) return null;

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const { addToCart, isInCart, openOrderModal } = useCart();
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

        <div className="pt-6 border-t border-gray-100 flex gap-3">
          {isInCart(license.id) ? (
            <button
              onClick={() => {
                onClose();
                openOrderModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-sm shadow-lg shadow-green-500/20"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{t('cart.proceed_purchase') || 'Checkout'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                addToCart({
                  id: license.id,
                  category: license.category,
                  name: licenseName,
                  description: licenseDesc,
                  price: license.price_gross_euros,
                  processingDays: license.processing_days,
                  imageUrl: license.image_url,
                });
                toast.success(t('cart.added') || 'Added to cart!');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-german-red to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all text-sm shadow-lg shadow-german-red/20"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('cart.add') || 'Add to Cart'}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default LicenseDetailModal;
