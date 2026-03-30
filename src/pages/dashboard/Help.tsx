import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Search, LifeBuoy, FileText, BookOpen, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

interface Article {
  id: string;
  category: string;
  title_fr: string;
  title_en: string;
  slug: string;
}

const Help: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .select('id, category, title_fr, title_en, slug');
      
      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data);
      }
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return articles.filter(article => 
      (i18n.language === 'fr' ? article.title_fr : article.title_en).toLowerCase().includes(lowercasedTerm) ||
      article.category.toLowerCase().includes(lowercasedTerm)
    );
  }, [articles, searchTerm, i18n.language]);

  const articlesByCategory = useMemo(() => {
    return filteredArticles.reduce((acc, article) => {
      (acc[article.category] = acc[article.category] || []).push(article);
      return acc;
    }, {} as Record<string, Article[]>);
  }, [filteredArticles]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <DashboardHeader
        title="Hilfe & Support"
        subtitle="Finden Sie Antworten auf häufig gestellte Fragen"
        icon={LifeBuoy}
      />
      
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Durchsuchen Sie unsere Hilfe-Artikel..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 p-4 border border-gray-300 rounded-full shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="space-y-8">
          {Object.keys(articlesByCategory).length > 0 ? (
            Object.entries(articlesByCategory).map(([category, articles]) => (
              <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-red-600" />
                  {category}
                </h2>
                <ul className="space-y-1">
                  {articles.map(article => (
                    <li key={article.id}>
                      <Link to={`/dashboard/help/${article.slug}`} className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors group">
                        <FileText className="w-4 h-4 mr-3 text-gray-400 group-hover:text-german-red" />
                        <span className="text-german-red group-hover:underline">
                          {i18n.language === 'fr' ? article.title_fr : article.title_en}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-600">Keine Ergebnisse gefunden</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Help;
