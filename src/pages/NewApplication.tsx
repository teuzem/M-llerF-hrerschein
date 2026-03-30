/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { supabase, LicenseApplication } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StripeCheckoutForm from '../components/payment/StripeCheckoutForm';
import PayPalButtonsComponent from '../components/payment/PayPalButtonsComponent';
import CryptoPayment from '../components/payment/CryptoPayment';
import { CreditCard, ShoppingCart, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const isStripeConfigured = stripePublishableKey && !stripePublishableKey.startsWith('YOUR_');
const isPaypalConfigured = paypalClientId && !paypalClientId.startsWith('YOUR_');

const stripePromise = isStripeConfigured ? loadStripe(stripePublishableKey) : null;

const NewApplication: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'paypal' | 'crypto'>('stripe');

  const applicationId = searchParams.get('applicationId');

  useEffect(() => {
    if (!applicationId || !user) {
      setLoading(false);
      return;
    }

    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('license_applications')
          .select('*, license_type:license_types(*)')
          .eq('id', applicationId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data.status !== 'pending_payment') {
          toast.error(t('payment.error.already_paid'));
          navigate('/dashboard');
          return;
        }

        setApplication(data);
      } catch (error) {
        toast.error(t('payment.error.not_found'));
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, user, navigate, t]);

  const handlePaymentSuccess = async (paymentDetails: { paymentMethod: string; transactionId?: string }) => {
    if (!application) return;

    // 1. Update Application Status
    const { data: appData, error: appError } = await supabase
      .from('license_applications')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', application.id)
      .select()
      .single();

    if (appError || !appData) {
      toast.error(t('payment.error.app_update_failed'));
      console.error(appError);
      return;
    }

    // 2. Create Payment Record
    const { error: paymentError } = await supabase.from('payments').insert({
      application_id: application.id,
      amount_euros: application.total_amount,
      status: 'completed',
      payment_method: paymentDetails.paymentMethod,
      transaction_id: paymentDetails.transactionId,
      paid_at: new Date().toISOString(),
    });

    if (paymentError) {
      toast.error(t('payment.error.payment_record_failed'));
      console.error(paymentError);
      return;
    }

    toast.success(t('payment.success.title'));
    setTimeout(() => navigate('/dashboard'), 3000);
  };

  const paymentOptions = [
    { id: 'stripe', name: t('payment.methods.card'), icon: CreditCard },
    { id: 'paypal', name: t('payment.methods.paypal'), icon: () => <img src="https://www.paypalobjects.com/webstatic/mktg/logo-center/PP_Acceptance_Marks_for_LogoCenter_266x142.png" alt="PayPal" className="h-6" /> },
    { id: 'crypto', name: t('payment.methods.crypto'), icon: () => <span className="font-bold text-lg">₿</span> },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <p>{t('payment.error.no_order')}</p>
        <Button onClick={() => navigate('/services')} className="mt-4">{t('nav.services')}</Button>
      </div>
    );
  }

  const renderPaymentMethod = () => {
    switch (selectedPaymentMethod) {
      case 'stripe':
        return isStripeConfigured && stripePromise ? (
          <Elements stripe={stripePromise}>
            <StripeCheckoutForm 
              totalAmount={application.total_amount} 
              applicationId={application.id}
              licenseType={application.license_type?.category || 'B'}
              onPaymentSuccess={handlePaymentSuccess} 
            />
          </Elements>
        ) : (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">{t('payment.config.stripe_missing')}</p>
          </div>
        );
      case 'paypal':
        return isPaypalConfigured ? (
          <PayPalScriptProvider options={{ clientId: paypalClientId!, currency: "EUR" }}>
            <PayPalButtonsComponent totalAmount={application.total_amount} onPaymentSuccess={handlePaymentSuccess} />
          </PayPalScriptProvider>
        ) : (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">{t('payment.config.paypal_missing')}</p>
          </div>
        );
      case 'crypto':
        return <CryptoPayment totalAmount={application.total_amount} onPaymentSuccess={handlePaymentSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('payment.title')}</h1>
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Order Summary */}
          <div className="bg-white p-8 rounded-2xl shadow-xl h-fit">
            <h2 className="text-2xl font-semibold mb-6 flex items-center"><ShoppingCart className="mr-3 text-german-red" />{t('payment.summary.title')}</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-gray-700">
                <span>{application.license_type?.name_de || t('payment.summary.license')}</span>
                <span className="font-medium">{application.license_type?.price_gross_euros.toFixed(2)}€</span>
              </div>
              {application.theory_test_needed && (
                <div className="flex justify-between items-center text-gray-700">
                  <span>{t('payment.summary.theory_test')}</span>
                  <span className="font-medium">{application.theory_test_fee.toFixed(2)}€</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-xl font-bold text-gray-900">
              <span>{t('payment.summary.total')}</span>
              <span>{application.total_amount.toFixed(2)}€</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">{t('payment.methods.title')}</h2>
            <div className="flex space-x-2 border border-gray-200 rounded-lg p-1 mb-6 bg-gray-50">
              {paymentOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedPaymentMethod(opt.id as any)}
                  className={`w-full flex items-center justify-center p-3 rounded-md transition-colors text-sm font-medium ${selectedPaymentMethod === opt.id ? 'bg-white shadow text-german-red' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <opt.icon className="mr-2 h-5 w-5" />
                  {opt.name}
                </button>
              ))}
            </div>

            <div>
              {renderPaymentMethod()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewApplication;
