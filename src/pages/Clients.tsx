import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, Profile } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import { Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientCard: React.FC<{ profile: Profile }> = ({ profile }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <Avatar name={profile.full_name || 'Client'} avatarUrl={profile.avatar_url} size="lg" />
      <h3 className="mt-4 font-bold text-lg text-gray-800">{profile.full_name}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {t('public_profile.member_since')} {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
      </p>
      <Link
        to={`/clients/${profile.id}`}
        className="inline-block mt-2 text-sm font-medium text-german-red hover:text-red-800"
      >
        {t('clients.view_profile')} &rarr;
      </Link>
    </motion.div>
  );
};

const Clients: React.FC = () => {
  const { t } = useTranslation();
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
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [profiles, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-6xl font-bold mb-4 flex items-center justify-center">
            <Users className="w-12 h-12 mr-4" />
            {t('clients.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            {t('clients.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-12 max-w-lg mx-auto">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('clients.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-full border-gray-300 pl-10 pr-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredProfiles.map(profile => (
                <ClientCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">{t('clients.no_results')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Clients;
