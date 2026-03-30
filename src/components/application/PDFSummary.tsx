import React from 'react';
import { LicenseApplication, Profile } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface PDFSummaryProps {
  application: Partial<LicenseApplication> & { region?: { value: string, label: string } | null };
  profile: Profile | null;
}

const PDFSummary: React.FC<PDFSummaryProps> = ({ application, profile }) => {
  const { t } = useTranslation();
  if (!profile) return null;

  const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div className="flex justify-between py-2">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-sm font-medium text-gray-800 text-right">{value || 'Non fourni'}</p>
    </div>
  );

  return (
    <div className="p-8 bg-white text-gray-800 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-german-gold">MüllerFührerschein</h1>
        <p className="text-gray-600">Récapitulatif de votre demande de permis</p>
        {application.application_number && <p className="font-mono text-lg mt-2">ID: {application.application_number}</p>}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-blue-700 border-b pb-2">Informations Personnelles</h2>
          <InfoRow label="Nom" value={profile.full_name} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Téléphone" value={profile.phone} />
          <InfoRow label="Numéro NEPH" value={application.form_data?.neph} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-blue-700 border-b pb-2">Adresse de Soumission</h2>
          <InfoRow label="Adresse" value={application.address} />
          <InfoRow label="Ville" value={application.city} />
          <InfoRow label="Code Postal" value={application.postal_code} />
          <InfoRow label="Région" value={application.region?.label || application.region} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-blue-700 border-b pb-2">Détails de la Demande</h2>
          <InfoRow label="Type de Permis" value={application.license_type?.name_de} />
          <InfoRow label="Catégorie" value={application.license_type?.category} />
          {application.theory_test_needed && (
            <InfoRow label={t('payment.summary.theory_test')} value={`${application.theory_test_fee?.toFixed(2)}€`} />
          )}
          <div className="border-t mt-2 pt-2">
            <InfoRow label="Montant Total (TTC)" value={`${application.total_amount?.toFixed(2)}€`} />
          </div>
        </div>
      </div>
      
      <div className="mt-10 text-center text-xs text-gray-500">
        <p>Ce document est un récapitulatif de votre demande en date du {new Date().toLocaleDateString('fr-FR')}.</p>
        <p>Il ne constitue pas une preuve d'obtention du permis.</p>
        <p className="font-bold mt-2">MüllerFührerschein</p>
      </div>
    </div>
  );
};

export default PDFSummary;
