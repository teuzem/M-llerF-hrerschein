import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, Profile } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import { Search, Users, ShieldCheck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '../components/seo/SEOHead';
import { pageSEO } from '../lib/seoData';

const ClientCard: React.FC<{ profile: Profile }> = ({ profile }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full"
    >
      <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 relative border-b border-gray-100">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="p-1.5 bg-white rounded-full shadow-sm">
            <Avatar name={profile.full_name || 'Client'} avatarUrl={profile.avatar_url} size="lg" />
          </div>
        </div>
      </div>
      
      <div className="pt-14 pb-6 px-6 text-center flex-grow flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 flex items-center justify-center gap-1.5">
          {profile.full_name}
          <ShieldCheck className="w-4 h-4 text-german-red" aria-label="Verified Customer" />
        </h3>
        
        <div className="mt-2 flex flex-col items-center justify-center gap-2 text-sm text-gray-500 mb-6 flex-grow">
          {(profile.city || profile.region) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile.city}{profile.city && profile.region ? ', ' : ''}{profile.region}
            </span>
          )}
          <span className="bg-red-50 text-german-red px-3 py-1 rounded-full text-xs font-semibold">
            {t('public_profile.member_since', 'Member since')} {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
          </span>
        </div>

        <Link
          to={`/clients/${profile.id}`}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-german-red hover:text-white transition-colors duration-300 group-hover:bg-german-red group-hover:text-white mt-auto"
        >
          {t('clients.view_profile', 'View Profile')} &rarr;
        </Link>
      </div>
    </motion.div>
  );
};

const Clients: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPublicProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProfiles(data || []);
      } catch (error) {
        toast.error("Fehler beim Laden der Kundenprofile.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p =>
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.region?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [profiles, searchTerm]);

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const seoData = (pageSEO as any)[currentLang]?.clients || pageSEO.de.clients;

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        locale={currentLang}
      />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white border-b border-gray-100 py-16 sm:py-24 relative overflow-hidden">
          {/* Abstract background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-german-red/5 blur-3xl -z-10 rounded-full" />
          
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-3 bg-red-50 rounded-2xl mb-6">
              <Users className="w-8 h-8 text-german-red" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6">
              {t('clients.title', 'Our Trusted Clients')}
            </motion.h1>
            <div className="w-20 h-1.5 bg-german-red mx-auto mb-8 rounded-full"></div>
            <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('clients.subtitle', 'Discover the amazing people who have successfully obtained their driving license with us.')}
            </motion.p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="mb-12 max-w-xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-german-red transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={t('clients.search_placeholder', 'Search clients by name or location...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-200 pl-12 pr-4 py-4 text-gray-900 bg-white shadow-sm focus:border-german-red focus:ring-4 focus:ring-german-red/10 transition-all text-base"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
            ) : filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {filteredProfiles.map(profile => (
                  <ClientCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm max-w-2xl mx-auto">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Keine Ergebnisse gefunden</h3>
                <p className="text-gray-500">{t('clients.no_results', 'No clients found matching your search.')}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Clients;
