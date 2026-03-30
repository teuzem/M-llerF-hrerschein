import React from 'react';
import { NavLink } from 'react-router-dom';
import { Chrome as Home, Briefcase, Users, Phone, Grid2x2 as Grid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/services', icon: Briefcase, label: t('nav.services') },
    { to: '/gallery', icon: Grid, label: t('nav.gallery') },
    { to: '/clients', icon: Users, label: t('nav.clients') },
    { to: '/contact', icon: Phone, label: t('nav.contact') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                isActive
                  ? 'text-german-red'
                  : 'text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
