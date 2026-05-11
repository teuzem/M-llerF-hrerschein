import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';

export default function FAQ() {
  const { t } = useTranslation();
  
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = {
    general: t('faq.categories.general', 'General'),
    process: t('faq.categories.process', 'Application Process'),
    security: t('faq.categories.security', 'Security & Legal')
  };

  const questions = t('faq.questions', { returnObjects: true }) as { category: string, q: string, a: string }[];
  
  // Filter questions based on active category
  const filteredQuestions = Array.isArray(questions) 
    ? questions.filter(q => q.category === activeCategory)
    : [];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <SEOHead 
        title={`${t('faq.title', 'FAQ')} | MüllerFührerschein`} 
        description={t('faq.description', 'Find answers to common questions about our driving license services.')} 
      />
      <div className="min-h-screen bg-gray-50 pb-20">
        
        {/* Header Section */}
        <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white pt-24 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <HelpCircle className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"
            >
              {t('faq.title', 'Frequently Asked Questions')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto"
            >
              {t('faq.description', 'Find answers to common questions about our driving license services.')}
            </motion.p>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* Category Tabs */}
            <div className="flex flex-col sm:flex-row border-b border-gray-100 p-2 sm:p-0 bg-gray-50/50">
              {Object.entries(categories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    setOpenIndex(null); // Reset open accordion on tab switch
                  }}
                  className={`flex-1 py-4 px-6 text-sm sm:text-base font-semibold text-center transition-all ${
                    activeCategory === key
                      ? 'text-german-red bg-white border-b-2 border-german-red shadow-sm sm:shadow-none sm:rounded-t-xl z-10'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl sm:rounded-none'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Accordion List */}
            <div className="p-6 sm:p-10 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((item, index) => {
                      const isOpen = openIndex === index;
                      return (
                        <div 
                          key={index} 
                          className={`border rounded-2xl transition-colors duration-300 ${isOpen ? 'border-german-red/30 bg-red-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                        >
                          <button
                            onClick={() => toggleAccordion(index)}
                            className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            aria-expanded={isOpen}
                          >
                            <span className="text-lg font-bold text-gray-900 pr-8">{item.q}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? 'bg-german-red text-white rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                              <ChevronDown className="w-5 h-5" />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100/50 mt-2">
                                  {item.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No questions found for this category.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Still have questions CTA */}
            <div className="bg-gray-50 p-8 text-center border-t border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm mb-4">
                <MessageCircle className="w-6 h-6 text-german-red" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Can't find the answer you're looking for? Please chat to our friendly team.</p>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Contact Support
              </a>
            </div>

          </div>
        </section>

      </div>
    </>
  );
}
