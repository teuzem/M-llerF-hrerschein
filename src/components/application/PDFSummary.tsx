import React from 'react';
import { LicenseApplication, Profile } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface PDFSummaryProps {
  application: Partial<LicenseApplication> & { region?: { value: string, label: string } | null };
  profile: Profile | null;
}

const PDFSummary: React.FC<PDFSummaryProps> = ({ application, profile }) => {
  const { t, i18n } = useTranslation();
  if (!profile) return null;

  const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : i18n.language?.startsWith('en') ? 'en-US' : 'de-DE';

  const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div className="flex justify-between py-2">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-sm font-medium text-gray-800 text-right">{value || t('pdf.summary.not_provided')}</p>
    </div>
  );

  return (
    <div className="p-8 bg-white text-gray-800 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-german-gold">MüllerFührerschein</h1>
        <p className="text-gray-600">{t('pdf.summary.subtitle')}</p>
        {application.application_number && <p className="font-mono text-lg mt-2">ID: {application.application_number}</p>}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-blue-700 border-b pb-2">{t('pdf.summary.personal_info')}</h2>
          <InfoRow label={t('pdf.summary.name')} value={profile.full_name} />
          <InfoRow label={t('pdf.summary.email')} value={profile.email} />
          <InfoRow label={t('pdf.summary.phone')} value={profile.phone} />
          <InfoRow label={t('pdf.summary.neph')} value={application.form_data?.neph} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-blue-700 border-b pb-2">{t('pdf.summary.submission_address')}</h2>
          <InfoRow label={t('pdf.summary.address')} value={application.address} />
          <InfoRow label={t('pdf.summary.city')} value={application.city} />
          <InfoRow label={t('pdf.summary.postal_code')} value={application.postal_code} />
          <InfoRow label={t('pdf.summary.region')} value={application.region?.label || application.region} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-blue-700 border-b pb-2">{t('pdf.summary.request_details')}</h2>
          <InfoRow label={t('pdf.summary.license_type')} value={application.license_type?.name_de} />
          <InfoRow label={t('pdf.summary.category')} value={application.license_type?.category} />
          {application.theory_test_needed && (
            <InfoRow label={t('payment.summary.theory_test')} value={`${application.theory_test_fee?.toFixed(2)}€`} />
          )}
          <div className="border-t mt-2 pt-2">
            <InfoRow label={t('pdf.summary.total_amount')} value={`${application.total_amount?.toFixed(2)}€`} />
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-gray-500">
        <p>{t('pdf.summary.disclaimer', { date: new Date().toLocaleDateString(locale) })}</p>
        <p>{t('pdf.summary.not_a_proof')}</p>
        <p className="font-bold mt-2">MüllerFührerschein</p>
      </div>
    </div>
  );
};

export default PDFSummary;
