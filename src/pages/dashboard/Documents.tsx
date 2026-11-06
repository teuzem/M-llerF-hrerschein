import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Download, File as FileIcon, FolderOpen, FileType, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardData } from '../../hooks/useDashboardData';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Accordion from '../../components/ui/Accordion';

interface DashboardDocumentsProps {
  data: DashboardData;
}

interface EnrichedDocument {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  application_id: string;
  application_number: string;
  license_name: string;
  mime_type?: string;
}

const DocumentCard: React.FC<{ doc: EnrichedDocument, onDownload: (path: string, name: string) => void }> = ({ doc, onDownload }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : i18n.language?.startsWith('en') ? 'en-US' : 'de-DE';

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileType className="w-8 h-8 text-red-500" />;
    return <FileIcon className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="bg-white p-4 rounded-lg border flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {getFileIcon(doc.mime_type)}
        <div>
          <p className="font-medium text-sm text-gray-800 truncate max-w-xs">{doc.file_name}</p>
          <p className="text-xs text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString(locale)}</p>
        </div>
      </div>
      <button onClick={() => onDownload(doc.file_path, doc.file_name)} className="p-2 text-gray-500 hover:text-german-red hover:bg-gray-100 rounded-full">
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
};

const DashboardDocuments: React.FC<DashboardDocumentsProps> = ({ data }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<EnrichedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !data?.applications) {
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const allDocs: EnrichedDocument[] = [];
        for (const app of data.applications) {
          if (!app.application_number) continue;

          const { data: storageFiles, error: storageError } = await supabase.storage
            .from('application-documents')
            .list(`${user.id}/${app.id}`);
          
          if (storageError) {
            console.warn(`Could not list documents for app ${app.id}:`, storageError.message);
            continue;
          }

          storageFiles?.forEach(file => {
            if (file.name !== '.emptyFolderPlaceholder') {
              allDocs.push({
                id: file.id,
                file_name: file.name,
                file_path: `${user.id}/${app.id}/${file.name}`,
                uploaded_at: file.created_at,
                application_id: app.id as string,
                application_number: app.application_number as string,
                license_name: app.license_type?.name_de || 'N/A',
                mime_type: file.metadata?.mimetype as string || '',
              });
            }
          });
        }
        setDocuments(allDocs);
      } catch (error: any) {
        toast.error(t('dashboard.documents.error_loading', 'Fehler beim Laden der Dokumente: ') + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user, data]);

  const docsByApplication = useMemo(() => {
    return documents.reduce((acc, doc) => {
      if (!acc[doc.application_id]) {
        acc[doc.application_id] = {
          application_number: doc.application_number,
          license_name: doc.license_name,
          docs: []
        };
      }
      acc[doc.application_id].docs.push(doc);
      return acc;
    }, {} as Record<string, { application_number: string, license_name: string, docs: EnrichedDocument[] }>);
  }, [documents]);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('application-documents')
        .download(filePath);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t('dashboard.documents.error_download', 'Erreur lors du téléchargement du fichier.'));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <DashboardHeader
        title={t('dashboard.documents.title', 'Dokumente')}
        subtitle={t('dashboard.documents.subtitle', 'Verwalten Sie Ihre Dokumente und Unterlagen')}
        icon={FolderOpen}
      />
      
      {Object.keys(docsByApplication).length > 0 ? (
        <div className="space-y-4">
          {Object.values(docsByApplication).map(appData => (
            <Accordion key={appData.application_number} title={`${t('dashboard.documents.application', 'Demande')} ${appData.application_number} - ${appData.license_name}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {appData.docs.length > 0 ? (
                  appData.docs.map(doc => <DocumentCard key={doc.id} doc={doc} onDownload={handleDownload} />)
                ) : (
                  <p className="text-sm text-gray-500">{t('dashboard.documents.no_docs_app', 'Keine Dokumente für diese Bewerbung')}</p>
                )}
              </div>
            </Accordion>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800">{t('dashboard.documents.no_docs', 'Keine Dokumente vorhanden')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.documents.no_docs_desc', 'Ihre Dokumente werden hier angezeigt, sobald Sie einen Antrag eingereicht haben.')}</p>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardDocuments;
