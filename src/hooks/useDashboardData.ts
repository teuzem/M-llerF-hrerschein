import { useState, useEffect } from 'react';
import { supabase, LicenseApplication, Payment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DashboardData {
  applications: LicenseApplication[];
  payments: Payment[];
  stats: {
    inProgress: number;
    completed: number;
    totalSpent: number;
  };
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch applications with related license types
        const { data: appData, error: appError } = await supabase
          .from('license_applications')
          .select('*, license_type:license_types!license_type_id(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (appError) throw new Error(`Applications: ${appError.message}`);
        
        const applications = appData || [];
        let payments: Payment[] = [];

        if (applications.length > 0) {
          const appIds = applications.map(a => a.id);
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .in('application_id', appIds);
          
          if (paymentError) throw new Error(`Payments: ${paymentError.message}`);
          payments = paymentData || [];
        }

        // Calculate stats
        const inProgress = applications.filter(a => a.status !== 'completed' && a.status !== 'rejected').length;
        const completed = applications.filter(a => a.status === 'completed').length;
        
        // Safely calculate total spent
        const totalSpent = payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.amount_euros || 0), 0);

        setData({
          applications,
          payments,
          stats: {
            inProgress,
            completed,
            totalSpent,
          },
        });

      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { data, loading, error };
};
