import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase, LicenseApplication } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckCircle, Clock, FileText, Loader, AlertCircle } from 'lucide-react';

const ApplicationStatus: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(t('status.enter_id'));
      return;
    }

    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('license_applications')
          .select('*, license_type:license_types(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setApplication(data);
      } catch (err) {
        setError(t('status.not_found'));
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, t]);

  const statusSteps = [
    { status: 'pending_payment', label: t('status.step_pending_payment'), icon: Clock },
    { status: 'submitted', label: t('status.step_submitted'), icon: FileText },
    { status: 'in_review', label: t('status.step_in_review'), icon: Loader },
    { status: 'approved', label: t('status.step_approved'), icon: CheckCircle },
    { status: 'completed', label: t('status.step_completed'), icon: CheckCircle },
    { status: 'rejected', label: t('status.step_rejected'), icon: AlertCircle },
  ];

  const currentStatusIndex = application ? statusSteps.findIndex(s => s.status === application.status) : -1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rejected': return 'red';
      case 'completed':
      case 'approved': return 'green';
      case 'in_review': return 'blue';
      default: return 'gray';
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('status.title')}</h1>
          <p className="text-gray-600 mt-2">{t('status.subtitle')}</p>
        </div>

        {error ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : application && (
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="text-center border-b pb-6 mb-6">
              <p className="text-sm text-gray-500">{t('status.app_number')}</p>
              <p className="text-2xl font-bold text-gray-800 font-mono">{application.application_number}</p>
              <p className="text-sm text-gray-500 mt-2">{application.license_type?.name_de}</p>
            </div>
            
            <div className="space-y-8">
              {statusSteps.map((step, index) => {
                if (application.status === 'rejected' && step.status !== 'rejected') return null;
                if (step.status === 'rejected' && application.status !== 'rejected') return null;

                const isCompleted = currentStatusIndex >= index;
                const isCurrent = currentStatusIndex === index;
                const color = getStatusColor(step.status);

                return (
                  <div key={step.status} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full
                          ${isCompleted ? `bg-${color}-500 text-white` : 'bg-gray-200 text-gray-500'}
                          ${isCurrent ? 'animate-pulse' : ''}
                        `}>
                          <step.icon className="w-5 h-5" />
                        </div>
                      </div>
                      {index < statusSteps.length - 2 && <div className={`w-px h-full ${isCompleted ? `bg-${color}-300` : 'bg-gray-200'}`}></div>}
                    </div>
                    <div className={`pt-1 ${isCompleted ? '' : 'text-gray-500'}`}>
                      <p className="font-semibold">{step.label}</p>
                      {isCurrent && <p className="text-sm">{t('status.last_update')}: {new Date(application.updated_at).toLocaleString('fr-FR')}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ApplicationStatus;
