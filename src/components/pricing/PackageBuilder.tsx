import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowRight, ShoppingCart } from 'lucide-react';
import { LicenseType } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

interface PackageBuilderProps {
  licenseTypes: LicenseType[];
}

const PackageBuilder: React.FC<PackageBuilderProps> = ({ licenseTypes }) => {
  const { t, i18n } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [selectedLicenses, setSelectedLicenses] = useState<LicenseType[]>([]);

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const { addToCart, isInCart, openOrderModal } = useCart();
  const bundleId = `bundle-${Array.from(selectedIds).sort().join('-')}`;

  useEffect(() => {
    const licensesInPackage = licenseTypes.filter(lt => selectedIds.has(lt.id));
    setSelectedLicenses(licensesInPackage);

    let currentTotal = 0;
    licensesInPackage.forEach(license => {
      currentTotal += license.price_gross_euros;
    });

    let currentDiscount = 0;
    if (licensesInPackage.length === 2) {
      currentDiscount = currentTotal * 0.05; // 5% discount
    } else if (licensesInPackage.length >= 3) {
      currentDiscount = currentTotal * 0.10; // 10% discount
    }

    setTotalPrice(currentTotal);
    setDiscount(currentDiscount);
    setFinalPrice(currentTotal - currentDiscount);
  }, [selectedIds, licenseTypes]);

  const handleSelect = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const getLocalizedName = (lt: LicenseType) => {
    return (lt as any)[`name_${currentLang}`] || lt.name_de;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <Package className="w-8 h-8 text-green-600 mr-4" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{t('pricing.package.title')}</h3>
          <p className="text-gray-600">{t('pricing.package.subtitle')}</p>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-4">{t('pricing.package.step1')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {licenseTypes.map(lt => (
          <button key={lt.id} className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${selectedIds.has(lt.id) ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => handleSelect(lt.id)}>
            <p className="font-bold">{`${t('common.application')} ${lt.category}`}</p>
            <p className="text-sm text-gray-600 font-medium">{`${lt.price_gross_euros}€`}</p>
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-2 mt-8">{t('pricing.package.step2')}</p>
      <div className="bg-gray-50 p-6 rounded-lg mt-2 shadow-inner border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{t('pricing.package.summary')}</h4>
        
        <div className="mb-4 space-y-3">
          {selectedLicenses.length > 0 ? (
            selectedLicenses.map(license => (
              <div key={license.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 font-medium">{`${t('common.application')} ${license.category} - ${getLocalizedName(license)}`}</span>
                <span className="font-bold text-gray-900">{`${license.price_gross_euros.toFixed(2)}€`}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4 italic">{t('pricing.package.no_selection')}</p>
          )}
        </div>

        {selectedLicenses.length > 0 && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between items-center text-gray-600 text-sm">
              <span>{t('pricing.package.base_total')}</span>
              <span className="font-medium font-mono">{totalPrice.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center text-green-600 text-sm font-medium">
              <span>
                {t('pricing.package.discount')} 
                {selectedIds.size === 2 && ' (5%)'}
                {selectedIds.size >= 3 && ' (10%)'}
              </span>
              <span className="font-bold">-{discount.toFixed(2)}€</span>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between items-center text-xl font-extrabold text-gray-900">
              <span className="text-lg">{t('pricing.calculator.total_label')}</span>
              <span className="bg-yellow-100 px-3 py-1 rounded-lg">{finalPrice.toFixed(2)}€</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {isInCart(bundleId) ? (
          <button
            onClick={() => openOrderModal()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-base shadow-xl shadow-green-500/20"
          >
            <ArrowRight className="w-5 h-5" />
            <span>{t('cart.proceed_purchase') || 'Checkout'}</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (selectedIds.size === 0) return;
              const bundleName = `${t('pricing.package.title')} (${selectedLicenses.length} items)`;
              const desc = selectedLicenses.map(l => getLocalizedName(l)).join(', ');
              addToCart({
                id: bundleId,
                category: 'BUNDLE',
                name: bundleName,
                description: desc,
                price: finalPrice,
                processingDays: Math.max(...selectedLicenses.map(l => l.processing_days || 0)),
                imageUrl: selectedLicenses[0]?.image_url,
              });
              toast.success(t('cart.added') || 'Added to cart!');
            }}
            disabled={selectedIds.size === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base shadow-xl shadow-blue-500/20"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t('cart.add') || 'Add Bundle to Cart'}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PackageBuilder;
