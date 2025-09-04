
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ListChecks, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingWithdrawals: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { count: totalUsers, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        const { count: activeUsers, error: activeUsersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('account_active', true);
        
        if (activeUsersError) throw activeUsersError;

        const { count: pendingWithdrawals, error: withdrawalsError } = await supabase
          .from('withdrawals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (withdrawalsError) throw withdrawalsError;
        
        const { data: paidFees, error: feesError } = await supabase
            .from('users')
            .select('affiliation_fee')
            .eq('account_active', true);
        
        if (feesError) throw feesError;
        const totalRevenue = paidFees.reduce((acc, user) => acc + (user.affiliation_fee || 0), 0);


        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          pendingWithdrawals: pendingWithdrawals || 0,
          totalRevenue: totalRevenue || 0,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Utilisateurs Totaux', value: stats.totalUsers, icon: Users, color: "from-sky-500 to-cyan-500" },
    { title: 'Utilisateurs Actifs', value: stats.activeUsers, icon: Users, color: "from-green-500 to-emerald-500" },
    { title: 'Revenus Totaux (Frais)', value: `${stats.totalRevenue.toLocaleString()} FCFA`, icon: DollarSign, color: "from-amber-500 to-yellow-500" },
    { title: 'Retraits en Attente', value: stats.pendingWithdrawals, icon: stats.pendingWithdrawals > 0 ? AlertTriangle : ListChecks, color: stats.pendingWithdrawals > 0 ? "from-red-500 to-pink-500" : "from-teal-500 to-cyan-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-green-400 to-red-400"
      >
        Tableau de Bord Administrateur
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return(
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="glass-effect-darker border-slate-700/50 card-hover-admin">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">{card.title}</CardTitle>
                  <div className={`p-2.5 rounded-full bg-gradient-to-r ${card.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-sky-200">{card.value}</div>
                  {/* <p className="text-xs text-slate-400">+20.1% from last month</p> */}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-effect-darker border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-xl text-sky-300">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Add quick action buttons here if needed */}
             <p className="text-slate-400 col-span-full">D'autres fonctionnalités et graphiques peuvent être ajoutés ici.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
