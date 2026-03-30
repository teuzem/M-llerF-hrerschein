import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface Breadcrumb {
  label: string;
  path: string;
}

const routeNameMap: { [key: string]: string } = {
  services: 'nav.services',
  pricing: 'nav.pricing',
  testimonials: 'nav.testimonials',
  gallery: 'nav.gallery',
  clients: 'nav.clients',
  about: 'nav.about',
  contact: 'nav.contact',
  legal: 'footer.links.legal',
  privacy: 'footer.links.privacy',
  terms: 'footer.links.terms',
  dashboard: 'nav.dashboard',
  applications: 'dashboard.nav.applications',
  documents: 'dashboard.nav.documents',
  profile: 'dashboard.nav.profile',
  help: 'dashboard.nav.help',
  media: 'dashboard.nav.media',
};

const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const { t } = useTranslation();
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      setLoading(true);
      const pathnames = location.pathname.split('/').filter(x => x);
      const crumbs: Breadcrumb[] = [{ label: 'Accueil', path: '/' }];
      
      let currentPath = '';
      for (const segment of pathnames) {
        currentPath += `/${segment}`;
        let label = routeNameMap[segment] ? t(routeNameMap[segment]) : segment;

        // Handle dynamic segments
        if (params.id && currentPath.includes(params.id)) {
          if (currentPath.startsWith('/clients')) {
            const { data } = await supabase.from('profiles').select('full_name').eq('id', params.id).single();
            label = data?.full_name || 'Profil';
          }
        }
        if (params.slug && currentPath.includes(params.slug)) {
           if (currentPath.startsWith('/dashboard/help')) {
            const { data } = await supabase.from('knowledge_base_articles').select('title_fr').eq('slug', params.slug).single();
            label = data?.title_fr || 'Article';
          }
        }

        crumbs.push({ label, path: currentPath });
      }
      setBreadcrumbs(crumbs);
      setLoading(false);
    };

    generateBreadcrumbs();
  }, [location.pathname, params, t]);

  return { breadcrumbs, loading };
};

export default useBreadcrumbs;
