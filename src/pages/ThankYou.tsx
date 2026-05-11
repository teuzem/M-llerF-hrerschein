import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Mail, CreditCard, Clock, ArrowRight, Sparkles
} from 'lucide-react';
import ServiceCarousel from '../components/home/ServiceCarousel';
import SEOHead from '../components/seo/SEOHead';

export default function ThankYou() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to home if they didn't just come from an order submission
  // We check location.state.fromOrder to ensure they don't land here randomly
  useEffect(() => {
    if (!location.state?.fromOrder) {
      navigate('/', { replace: true });
    }
    // Scroll to top
    window.scrollTo(0, 0);
  }, [location, navigate]);

  if (!location.state?.fromOrder) return null;

  const orderNumber = location.state?.orderNumber;

  const features = [
    {
      icon: <Mail className="w-6 h-6 text-blue-500" />,
      title: t('thank_you.check_email.title'),
      desc: t('thank_you.check_email.desc'),
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-purple-500" />,
      title: t('thank_you.payment_info.title'),
      desc: t('thank_you.payment_info.desc'),
      bg: 'bg-purple-50',
      border: 'border-purple-100'
    },
    {
      icon: <Clock className="w-6 h-6 text-green-500" />,
      title: t('thank_you.processing.title'),
      desc: t('thank_you.processing.desc'),
      bg: 'bg-green-50',
      border: 'border-green-100'
    }
  ];

  return (
    <>
      <SEOHead 
        title={`${t('thank_you.title')} | MüllerFührerschein`}
        description={t('thank_you.subtitle')}
        noindex={true}
      />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
            >
              {t('thank_you.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 leading-relaxed mb-8"
            >
              {t('thank_you.subtitle')}
            </motion.p>

            {orderNumber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm mb-10"
              >
                <span className="text-sm font-medium text-gray-500">{t('order.order_number')}:</span>
                <span className="text-lg font-black text-german-red">{orderNumber}</span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl group"
              >
                {t('thank_you.back_home')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (idx * 0.1) }}
                className={`bg-white rounded-2xl p-8 border ${feature.border} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                
                <div className={`absolute -right-6 -bottom-6 w-32 h-32 ${feature.bg} rounded-full opacity-50 blur-2xl pointer-events-none`}></div>
              </motion.div>
            ))}
          </div>

          {/* Additional Services Upsell */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-16 border-t border-gray-200"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-german-red" />
                {t('thank_you.additional_services')}
              </h2>
            </div>
            
            <ServiceCarousel />
          </motion.div>

        </div>
      </div>
    </>
  );
}
