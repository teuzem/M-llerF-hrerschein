import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import Breadcrumbs from '../ui/Breadcrumbs';
import DashboardFooter from './DashboardFooter';
import MobileOffCanvas from './MobileOffCanvas';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <MobileOffCanvas isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-md">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent">
            MüllerFührerschein
          </h1>
          <div className="w-10" />
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Breadcrumbs />
            <div className="mt-4">
              {children}
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default DashboardLayout;
