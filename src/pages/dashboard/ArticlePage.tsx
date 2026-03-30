import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface Article {
  id: string;
  category: string;
  title_fr: string;
  title_en: string;
  content_fr: string;
  content_en: string;
  created_at: string;
}

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error('Error fetching article:', error);
        setError("Article non trouvé.");
      } else {
        setArticle(data);
      }
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !article) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700">{error || "Article non trouvé."}</h2>
        <Link to="/dashboard/help" className="mt-4 inline-flex items-center text-german-red hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'aide
        </Link>
      </div>
    );
  }

  const title = i18n.language === 'fr' ? article.title_fr : article.title_en;
  const content = i18n.language === 'fr' ? article.content_fr : article.content_en;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <Link to="/dashboard/help" className="inline-flex items-center text-sm text-german-red hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la base de connaissances
        </Link>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-red-600 mb-2">{article.category}</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xs text-gray-500 mb-6">
          Dernière mise à jour: {new Date(article.created_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="prose lg:prose-lg max-w-none">
          {content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ArticlePage;
