import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, Testimonial } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import TestimonialStats from '../../components/dashboard/testimonials/TestimonialStats';
import ReactionsChart from '../../components/dashboard/testimonials/ReactionsChart';
import UserTestimonialCard from '../../components/dashboard/testimonials/UserTestimonialCard';
import EditTestimonialModal from '../../components/dashboard/testimonials/EditTestimonialModal';
import ShareStatsChart from '../../components/dashboard/testimonials/ShareStatsChart';
import UserRatingDistributionChart from '../../components/dashboard/testimonials/UserRatingDistributionChart';
import { MessageSquare, PlusCircle } from 'lucide-react';

type Tab = 'published' | 'pending' | 'rejected';

const DashboardTestimonials: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('published');
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const fetchTestimonials = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data as Testimonial[]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('dashboard.testimonials.delete_confirm', 'Sind Sie sicher, dass Sie diese Bewertung löschen möchten?'))) return;

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast.success(t('dashboard.testimonials.delete_success', 'Bewertung erfolgreich gelöscht'));
    } catch (error: any) {
      toast.error(t('dashboard.testimonials.delete_error', 'Fehler beim Löschen der Bewertung'));
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
  };

  const filteredTestimonials = useMemo(() => {
    const statusMap = {
      published: 'approved',
      pending: 'pending',
      rejected: 'rejected',
    };
    return testimonials.filter(t => t.status === statusMap[activeTab]);
  }, [testimonials, activeTab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'published', label: t('dashboard.testimonials.tab_published', 'Veröffentlicht') },
    { id: 'pending', label: t('dashboard.testimonials.tab_pending', 'Ausstehend') },
    { id: 'rejected', label: t('dashboard.testimonials.tab_rejected', 'Abgelehnt') },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <EditTestimonialModal
        isOpen={!!editingTestimonial}
        onClose={() => setEditingTestimonial(null)}
        testimonial={editingTestimonial}
        onUpdate={fetchTestimonials}
      />

      <div className="bg-gradient-to-r from-german-black via-german-red to-german-gold text-white shadow-lg rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mr-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.testimonials.title', 'Bewertungen')}</h1>
            <p className="text-blue-100 text-sm">{t('dashboard.testimonials.subtitle', 'Verwalten Sie Ihre Kundenbewertungen')}</p>
          </div>
        </div>
        <Button as={Link} to="/testimonials" className="bg-white text-german-red hover:bg-gray-100">
          <PlusCircle className="w-4 h-4 mr-2" />
          {t('dashboard.testimonials.add_new', 'Neue Bewertung hinzufügen')}
        </Button>
      </div>

      <TestimonialStats testimonials={testimonials} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4 border-b">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-german-red text-german-red'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="space-y-4">
            {filteredTestimonials.length > 0 ? (
              filteredTestimonials.map(testimonial => (
                <UserTestimonialCard key={testimonial.id} testimonial={testimonial} onDelete={handleDelete} onEdit={handleEdit} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('dashboard.testimonials.empty', 'Keine Bewertungen vorhanden')}</h3>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <ReactionsChart testimonials={testimonials} />
          <ShareStatsChart testimonials={testimonials} />
          <UserRatingDistributionChart testimonials={testimonials} />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardTestimonials;
