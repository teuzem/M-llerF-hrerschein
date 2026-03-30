import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calculator, ArrowRight, MapPin, AlertTriangle } from 'lucide-react';
import { LicenseType } from '../../lib/supabase';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { regions, THEORY_TEST_FEE, TVA_RATE } from '../../lib/constants';

interface AdvancedPriceCalculatorProps {
  licenseTypes: LicenseType[];
}

const AdvancedPriceCalculator: React.FC<AdvancedPriceCalculatorProps> = ({ licenseTypes }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>(regions[0].value); // Default to Baden-Württemberg
  const [includeTheoryTest, setIncludeTheoryTest] = useState(false);

  const [basePrice, setBasePrice] = useState(0);
  const [theoryFee, setTheoryFee] = useState(0);
  const [tvaAmount, setTvaAmount] = useState(0);
  const [regionalTax, setRegionalTax] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const selectedLicense = licenseTypes.find(lt => lt.id === selectedLicenseId);
    const currentBasePrice = selectedLicense ? selectedLicense.price_gross_euros : 0;
    const currentTheoryFee = includeTheoryTest ? THEORY_TEST_FEE : 0;
    const regionData = regions.find(r => r.value === selectedRegion);
    // This is a simulation, real tax calculation can be more complex
    const currentRegionalTaxRate = (currentBasePrice / 10000) + (regionData ? regions.indexOf(regionData) * 0.001 : 0);

    const priceBeforeTVA = currentBasePrice + currentTheoryFee;
    const currentTVA = priceBeforeTVA * TVA_RATE;
    const currentRegionalTax = priceBeforeTVA * currentRegionalTaxRate;
    
    setBasePrice(currentBasePrice);
    setTheoryFee(currentTheoryFee);
    setTvaAmount(currentTVA);
    setRegionalTax(currentRegionalTax);
    setTotalPrice(priceBeforeTVA + currentTVA + currentRegionalTax);

  }, [selectedLicenseId, includeTheoryTest, selectedRegion, licenseTypes]);

  const getLocalizedName = (item: any) => {
    const lang = i18n.language.split('-')[0];
    return item[`name_${lang}`] || item.name_de || item.name;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <Calculator className="w-8 h-8 text-german-red mr-4" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{t('pricing.calculator.title')}</h3>
          <p className="text-gray-600">{t('pricing.calculator.subtitle')}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="license-select" className="block text-sm font-bold text-gray-700 mb-2">{t('pricing.calculator.step1')}</label>
            <select id="license-select" value={selectedLicenseId} onChange={(e) => setSelectedLicenseId(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="" disabled>-- {t('pricing.calculator.select_prompt')} --</option>
              {licenseTypes.map(lt => (
                <option key={lt.id} value={lt.id}>
                  {`${t('common.application')} ${lt.category} (${getLocalizedName(lt)})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="region-select" className="block text-sm font-bold text-gray-700 mb-2 flex items-center"><MapPin className="w-4 h-4 mr-2"/>{t('pricing.calculator.step2')}</label>
            <select id="region-select" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              {regions.map(r => (
                <option key={r.value} value={r.value}>
                  {t(`region.${r.value.toLowerCase().replace('-', '_')}`, r.label)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2">{t('pricing.calculator.step3')}</p>
            <div className="relative flex items-start">
              <div className="flex h-6 items-center"><input id="theory-test" type="checkbox" checked={includeTheoryTest} onChange={(e) => setIncludeTheoryTest(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-german-red focus:ring-blue-600" /></div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="theory-test" className="font-medium text-gray-900">{t('pricing.calculator.theory_test')}</label>
                <p className="text-gray-500">(+ {THEORY_TEST_FEE}€)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-bold text-gray-800 mb-4">{t('pricing.calculator.total_estimate')}</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-600"><span>{t('pricing.calculator.base_price_label')}</span><span className="font-medium">{basePrice.toFixed(2)}€</span></div>
            {includeTheoryTest && <div className="flex justify-between items-center text-gray-600"><span>{t('pricing.calculator.theory_fee_label')}</span><span className="font-medium">{theoryFee.toFixed(2)}€</span></div>}
            <div className="flex justify-between items-center text-gray-600"><span>{t('pricing.calculator.tva_label')} ({(TVA_RATE * 100).toFixed(0)}%)</span><span className="font-medium">{tvaAmount.toFixed(2)}€</span></div>
            <div className="flex justify-between items-center text-gray-600"><span>{t('pricing.calculator.regional_tax_label')}</span><span className="font-medium">{regionalTax.toFixed(2)}€</span></div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center text-2xl font-bold text-gray-900"><span>{t('pricing.calculator.total_label')}</span><span>{totalPrice.toFixed(2)}€</span></div>
          </div>
          <div className="mt-4 text-xs text-gray-500 flex items-start">
            <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"/>
            <span>{t('pricing.calculator.disclaimer')}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Button as={Link} to={user ? `/application/form?license=${selectedLicenseId}&theory=${includeTheoryTest}` : '/register'} disabled={!selectedLicenseId} className="w-full">
          {t('pricing.calculator.cta')} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default AdvancedPriceCalculator;
