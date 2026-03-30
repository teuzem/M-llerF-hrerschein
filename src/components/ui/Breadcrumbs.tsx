import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import useBreadcrumbs from '../../hooks/useBreadcrumbs';
import LoadingSpinner from './LoadingSpinner';

const Breadcrumbs: React.FC = () => {
  const { breadcrumbs, loading } = useBreadcrumbs();

  if (loading) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <LoadingSpinner size="sm" className="mr-2" />
        <span>Lädt...</span>
      </div>
    );
  }

  if (!breadcrumbs || breadcrumbs.length <= 1) {
    return null; // Don't show for root pages
  }

  return (
    <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center hover:text-german-red">
            <Home className="w-4 h-4 mr-2" />
            Startseite
          </Link>
        </li>
        {breadcrumbs.slice(1).map((crumb, index) => (
          <li key={crumb.path}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {index === breadcrumbs.length - 2 ? (
                <span className="ml-1 md:ml-2 font-medium text-gray-700">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="ml-1 md:ml-2 hover:text-german-red">
                  {crumb.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
