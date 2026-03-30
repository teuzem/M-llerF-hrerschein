import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, FileText, FolderOpen, User, HelpCircle, LogOut, Car, MessageSquare, Image as ImageIcon, MessageCircle as MessageIcon } from 'lucide-react';

const DashboardSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('header.user_menu.dashboard', 'Dashboard') },
    { to: '/dashboard/applications', icon: FileText, label: t('header.user_menu.applications', 'Anträge') },
    { to: '/dashboard/documents', icon: FolderOpen, label: t('header.user_menu.documents', 'Dokumente') },
    { to: '/dashboard/profile', icon: User, label: t('header.user_menu.profile', 'Profil') },
    { to: '/dashboard/testimonials', icon: MessageSquare, label: t('header.user_menu.testimonials', 'Bewertungen') },
    { to: '/dashboard/media', icon: ImageIcon, label: t('header.user_menu.media', 'Medien') },
    { to: '/dashboard/messages', icon: MessageIcon, label: t('header.user_menu.messages', 'Nachrichten') },
    { to: '/dashboard/help', icon: HelpCircle, label: t('header.user_menu.help', 'Hilfe') },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-20 shadow-md">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-german-black via-german-red to-german-gold rounded-lg flex items-center justify-center shadow-lg">
            <Car className="w-6 h-6 text-german-gold" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent">
            MüllerFührerschein
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-sm truncate">{profile?.full_name || t('profile.unnamed', 'Utilisateur')}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
