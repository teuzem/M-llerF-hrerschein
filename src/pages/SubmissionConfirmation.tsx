import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase, LicenseApplication, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import PDFSummary from '../components/application/PDFSummary';
import { CheckCircle, Download, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmissionConfirmation: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const pdfSummaryRef = useRef<HTMLDivElement>(null);

  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) {
      setLoading(false);
      return;
    }

    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('license_applications')
          .select('*, license_type:license_types(*)')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setApplication(data);
      } catch (error) {
        toast.error(t('status.not_found'));
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, user, navigate, t]);

  const handleDownloadPdf = async () => {
    if (!pdfSummaryRef.current) return;
    const canvas = await html2canvas(pdfSummaryRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`recapitulatif-demande-${application?.application_number}.pdf`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!application) {
    return <div className="text-center py-20">{t('status.not_found')}</div>;
  }

  const statusUrl = `${window.location.origin}/application/status/${application.id}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">{t('confirmation.title')}</h1>
        <p className="text-gray-600 mt-2 mb-8">{t('confirmation.subtitle')}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-german-gold">{t('confirmation.app_number')}</p>
          <p className="text-2xl font-bold text-blue-900 font-mono">{application.application_number}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h2 className="font-semibold text-lg mb-2">{t('confirmation.qr_code_title')}</h2>
            <p className="text-sm text-gray-600 mb-4">{t('confirmation.qr_code_desc')}</p>
            <Button onClick={handleDownloadPdf} variant="secondary" className="w-full mb-4">
              <Download className="mr-2 h-4 w-4" />
              {t('confirmation.download_pdf')}
            </Button>
            <Button as={Link} to={`/application/new?applicationId=${application.id}`} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              {t('confirmation.proceed_payment')}
            </Button>
          </div>
          <div className="flex justify-center">
            <div className="p-4 border rounded-lg bg-white">
              <QRCode value={statusUrl} size={160} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hidden element for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={pdfSummaryRef}>
          <PDFSummary application={application} profile={profile} />
        </div>
      </div>
    </div>
  );
};

export default SubmissionConfirmation;
