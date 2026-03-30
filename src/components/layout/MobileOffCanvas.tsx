import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, LayoutDashboard, FileText, FolderOpen, User, CircleHelp as HelpCircle, LogOut, MessageSquare, Image as ImageIcon, MessageCircle as MessageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

interface MobileOffCanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileOffCanvas: React.FC<MobileOffCanvasProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    onClose();
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/applications', icon: FileText, label: 'Anträge' },
    { to: '/dashboard/messages', icon: MessageIcon, label: 'Nachrichten' },
    { to: '/dashboard/profile', icon: User, label: 'Profil' },
    { to: '/dashboard/testimonials', icon: MessageSquare, label: 'Bewertungen' },
    { to: '/dashboard/media', icon: ImageIcon, label: 'Medien' },
    { to: '/dashboard/documents', icon: FolderOpen, label: 'Dokumente' },
    { to: '/dashboard/help', icon: HelpCircle, label: 'Hilfe' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">Menü</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-red-50">
            <div className="flex items-center space-x-3">
              <Avatar
                name={profile?.full_name || ''}
                avatarUrl={profile?.avatar_url}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {profile?.full_name || 'Utilisateur'}
                </p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileOffCanvas;
