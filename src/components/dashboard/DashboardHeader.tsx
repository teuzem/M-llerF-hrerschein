import React from 'react';
import { motion } from 'framer-motion';
import { LucideProps } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  children?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle, icon: Icon, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-german-black via-german-red to-german-gold text-white shadow-lg rounded-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div className="flex items-center">
        <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mr-4">
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-blue-100 text-sm">{subtitle}</p>
        </div>
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </motion.div>
  );
};

export default DashboardHeader;
