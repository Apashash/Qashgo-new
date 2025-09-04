
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Filter, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminWithdrawals = () => {
  const { t } = useTranslation();
  const [withdrawals, setWithdrawals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed', 'rejected', 'confirmed'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, [filterStatus]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('withdrawals')
        .select(`
          *,
          user:users (
            user_name, email
          )
        `)
        .order('requested_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast({ title: t('error'), description: t('errorLoadingWithdrawalHistory'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (withdrawalId, newStatus, userId, amount, source) => {
    try {
      let updatePayload = { status: newStatus, processed_at: new Date().toISOString() };
      if (newStatus === 'confirmed') {
        updatePayload.admin_confirmed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('withdrawals')
        .update(updatePayload)
        .eq('id', withdrawalId);
      if (error) throw error;

      if (newStatus === 'rejected' && userId && amount && source) {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('withdrawable_balance, youtube_balance, tiktok_balance, total_withdrawals')
          .eq('id', userId)
          .single();

        if (userError) throw userError;
        
        let balanceUpdate = {};
        if (source === 'main') {
            balanceUpdate.withdrawable_balance = (user.withdrawable_balance || 0) + amount;
        } else if (source === 'youtube') {
            balanceUpdate.youtube_balance = (user.youtube_balance || 0) + amount;
        } else if (source === 'tiktok') {
            balanceUpdate.tiktok_balance = (user.tiktok_balance || 0) + amount;
        }
        balanceUpdate.total_withdrawals = (user.total_withdrawals || 0) - amount;

        const { error: refundError } = await supabase
          .from('users')
          .update(balanceUpdate)
          .eq('id', userId);
        if (refundError) throw refundError;
      }

      toast({ title: t('success'), description: t('withdrawalStatusUpdated') });
      fetchWithdrawals();
    } catch (error) {
      console.error("Error updating withdrawal status:", error);
      toast({ title: t('error'), description: t('errorUpdatingStatus'), variant: "destructive" });
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/30 text-yellow-300 flex items-center"><Clock className="h-3 w-3 mr-1" />{t('statusPending')}</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/30 text-blue-300 flex items-center"><CheckCircle className="h-3 w-3 mr-1" />{t('statusCompleted')}</span>;
      case 'confirmed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/30 text-green-300 flex items-center"><CheckCheck className="h-3 w-3 mr-1" />{t('statusConfirmed')}</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/30 text-red-300 flex items-center"><XCircle className="h-3 w-3 mr-1" />{t('statusRejected')}</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-slate-500/30 text-slate-300">{status}</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div></div>;
  }
  
  const getBalanceSourceText = (source) => {
    if (source === 'main') return t('withdrawableBalanceGeneral');
    if (source === 'youtube') return t('youtubeVideoBalance');
    if (source === 'tiktok') return t('tiktokVideoBalance');
    return t('unknownSource');
  }


  return (
    <div className="space-y-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-green-400 to-red-400"
      >
        {t('manageWithdrawals')}
      </motion.h1>

      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-sky-300" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px] bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600 text-white">
            <SelectItem value="all" className="hover:bg-slate-700 focus:bg-slate-700">{t('all')}</SelectItem>
            <SelectItem value="pending" className="hover:bg-slate-700 focus:bg-slate-700">{t('statusPending')}</SelectItem>
            <SelectItem value="completed" className="hover:bg-slate-700 focus:bg-slate-700">{t('statusCompleted')}</SelectItem>
            <SelectItem value="confirmed" className="hover:bg-slate-700 focus:bg-slate-700">{t('statusConfirmed')}</SelectItem>
            <SelectItem value="rejected" className="hover:bg-slate-700 focus:bg-slate-700">{t('statusRejected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto glass-effect-darker border border-slate-700/50 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/30">
              <TableHead className="text-sky-300">{t('user')}</TableHead>
              <TableHead className="text-sky-300">{t('amount')}</TableHead>
              <TableHead className="text-sky-300">{t('source')}</TableHead>
              <TableHead className="text-sky-300">{t('method')}</TableHead>
              <TableHead className="text-sky-300">{t('number')}</TableHead>
              <TableHead className="text-sky-300">{t('dateRequested')}</TableHead>
              <TableHead className="text-sky-300">{t('status')}</TableHead>
              <TableHead className="text-sky-300">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id} className="border-slate-700 hover:bg-slate-800/50 transition-colors">
                <TableCell className="text-sky-100">
                  {withdrawal.user?.user_name || 'N/A'}
                  <br/>
                  <span className="text-xs text-sky-400">{withdrawal.user?.email || 'N/A'}</span>
                </TableCell>
                <TableCell className="text-sky-200 font-semibold">{withdrawal.amount.toLocaleString()} FCFA</TableCell>
                <TableCell className="text-sky-200">{getBalanceSourceText(withdrawal.source)}</TableCell>
                <TableCell className="text-sky-200">{withdrawal.method}</TableCell>
                <TableCell className="text-sky-200">{withdrawal.phone}</TableCell>
                <TableCell className="text-sky-200">{new Date(withdrawal.requested_at).toLocaleString(t('lng'))}</TableCell>
                <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                <TableCell>
                  {withdrawal.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                        onClick={() => updateWithdrawalStatus(withdrawal.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> {t('approve')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                        onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected', withdrawal.user_id, withdrawal.amount, withdrawal.source)}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> {t('reject')}
                      </Button>
                    </div>
                  )}
                  {withdrawal.status === 'completed' && (
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-green-500 text-green-400 hover:bg-green-500/20"
                        onClick={() => updateWithdrawalStatus(withdrawal.id, 'confirmed')}
                      >
                        <CheckCheck className="h-4 w-4 mr-1" /> {t('markAsConfirmed')}
                      </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
      {withdrawals.length === 0 && !loading && (
        <p className="text-center text-slate-400 py-8">{t('noWithdrawalRequestsForFilter')}</p>
      )}
    </div>
  );
};

export default AdminWithdrawals;
