import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, Plus, ArrowRight } from 'lucide-react';
import { LicenseType } from '../../lib/supabase';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface PriceCalculatorProps {
  licenseTypes: LicenseType[];
}

const THEORY_TEST_FEE = 300;

const PriceCalculator: React.FC<PriceCalculatorProps> = ({ licenseTypes }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>('');
  const [includeTheoryTest, setIncludeTheoryTest] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);

  useEffect(() => {
    const selectedLicense = licenseTypes.find(lt => lt.id === selectedLicenseId);
    const currentBasePrice = selectedLicense ? selectedLicense.price_gross_euros : 0;
    const theoryFee = includeTheoryTest ? THEORY_TEST_FEE : 0;
    
    setBasePrice(currentBasePrice);
    setTotalPrice(currentBasePrice + theoryFee);
  }, [selectedLicenseId, includeTheoryTest, licenseTypes]);

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
      
      <div className="space-y-6">
        {/* Step 1 */}
        <div>
          <label htmlFor="license-select" className="block text-sm font-bold text-gray-700 mb-2">{t('pricing.calculator.select_license')}</label>
          <select
            id="license-select"
            value={selectedLicenseId}
            onChange={(e) => setSelectedLicenseId(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="" disabled>-- Sélectionnez un permis --</option>
            {licenseTypes.map(lt => (
              <option key={lt.id} value={lt.id}>
                {`Permis ${lt.category} (${lt.name_de})`}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2 */}
        <div>
          <p className="block text-sm font-bold text-gray-700 mb-2">{t('pricing.calculator.add_options')}</p>
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="theory-test"
                name="theory-test"
                type="checkbox"
                checked={includeTheoryTest}
                onChange={(e) => setIncludeTheoryTest(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-german-red focus:ring-blue-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="theory-test" className="font-medium text-gray-900">{t('pricing.calculator.theory_test_option')}</label>
              <p className="text-gray-500">(+ {THEORY_TEST_FEE}€)</p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-50 p-6 rounded-lg mt-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">{t('pricing.calculator.total_title')}</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-600">
              <span>{t('pricing.calculator.base_price')}</span>
              <span className="font-medium">{basePrice.toLocaleString('fr-FR')}€</span>
            </div>
            {includeTheoryTest && (
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('pricing.calculator.theory_test_fee')}</span>
                <span className="font-medium">{THEORY_TEST_FEE.toLocaleString('fr-FR')}€</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center text-xl font-bold text-gray-900">
              <span>{t('pricing.calculator.total')}</span>
              <span>{totalPrice.toLocaleString('fr-FR')}€</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button 
          as={Link} 
          to={user ? `/application/new?license=${selectedLicenseId}` : '/register'}
          disabled={!selectedLicenseId}
          className="w-full"
        >
          {t('pricing.calculator.cta')} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PriceCalculator;
