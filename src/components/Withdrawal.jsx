
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Clock, DollarSign, Youtube, List, History } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.528 8.528c3.056 0 4.664 2.112 4.664 4.664S15.584 17.856 12.528 17.856s-4.664-2.112-4.664-4.664c0-.048.016-.08.016-.128.08-2.336 1.856-4.416 4.648-4.528Z"/><path d="M17.192 8.528V4.8H20.8v6.464A4.656 4.656 0 0 1 16.144 16H8.256V4.8h3.632v3.728"/>
  </svg>
);

const WithdrawalForm = ({ user, balanceType, availableBalance, minWithdrawal, onWithdrawalSuccess, t }) => {
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    method: '',
    phone: user.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const { updateUser: updateAuthContextUser } = useAuth();

  const withdrawalMethods = [
    { value: 'orange-money', label: 'Orange Money', icon: '🟠' },
    { value: 'mtn-money', label: 'MTN Mobile Money', icon: '🟡' },
    { value: 'moov-money', label: 'Moov Money', icon: '🔵' },
    { value: 'wave', label: 'Wave', icon: '💙' }
  ];

  const handleChange = (field, value) => {
    setWithdrawalData({ ...withdrawalData, [field]: value });
  };

  const validateWithdrawal = () => {
    const amount = parseFloat(withdrawalData.amount);
    if (!withdrawalData.amount || !withdrawalData.method || !withdrawalData.phone) {
      toast({ title: t('error'), description: t('allFieldsRequired'), variant: "destructive" });
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      toast({ title: t('error'), description: t('enterValidAmount'), variant: "destructive" });
      return false;
    }
    if (amount < minWithdrawal) {
      toast({ title: t('error'), description: t('amountLessThanMin', { amount: minWithdrawal }), variant: "destructive" });
      return false;
    }
    if (amount > availableBalance) {
      toast({ title: t('error'), description: t('amountMoreThanBalance'), variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleWithdrawal = async () => {
    if (!validateWithdrawal()) return;
    setLoading(true);
    const amount = parseFloat(withdrawalData.amount);

    try {
      const { error: insertError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: amount,
          method: withdrawalData.method,
          phone: withdrawalData.phone,
          status: 'pending',
          source: balanceType
        });
      if (insertError) throw insertError;

      let balanceUpdates = {};
      if (balanceType === 'main') {
        balanceUpdates.withdrawable_balance = (user.withdrawable_balance || 0) - amount;
      } else if (balanceType === 'youtube') {
        balanceUpdates.youtube_balance = (user.youtube_balance || 0) - amount;
      } else if (balanceType === 'tiktok') {
        balanceUpdates.tiktok_balance = (user.tiktok_balance || 0) - amount;
      }
      balanceUpdates.total_withdrawals = (user.total_withdrawals || 0) + amount;


      const { data: updatedUser, error: updateUserError } = await supabase
        .from('users')
        .update(balanceUpdates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateUserError) throw updateUserError;

      updateAuthContextUser(updatedUser);

      toast({ title: t('withdrawalRequestSent'), description: t('withdrawalRequestDesc', { amount: amount.toLocaleString() }) });
      setWithdrawalData({ amount: '', method: '', phone: user.phone || '' });
      if (onWithdrawalSuccess) onWithdrawalSuccess();

    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({ title: t('withdrawalError'), description: error.message || t('withdrawalErrorDesc'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-sky-300/20 card-hover-sky">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sky-300">
          <CreditCard className="h-5 w-5" />
          <span>{t('newWithdrawalRequest')}</span>
        </CardTitle>
        <CardDescription className="text-sky-200/70">{t('fillFormToWithdraw')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {availableBalance < minWithdrawal ? (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-300 font-semibold">{t('insufficientBalance')}</p>
            </div>
            <p className="text-sm text-sky-200/80 mt-2">
              {t('insufficientBalanceDesc', { amount: minWithdrawal.toLocaleString() })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`amount-${balanceType}`} className="text-sky-200">{t('amountToWithdraw')}</Label>
              <Input id={`amount-${balanceType}`} type="number" value={withdrawalData.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder={t('minAmount', { amount: minWithdrawal.toLocaleString() })} className="bg-sky-500/10 border-sky-300/30 text-white placeholder:text-sky-300/50" min={minWithdrawal} max={availableBalance} />
              <p className="text-xs text-sky-200/80">{t('availableBalance')}: {availableBalance.toLocaleString()} FCFA</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sky-200">{t('withdrawalMethod')}</Label>
              <Select value={withdrawalData.method} onValueChange={(value) => handleChange('method', value)}>
                <SelectTrigger className="bg-sky-500/10 border-sky-300/30 text-white placeholder:text-sky-300/50"><SelectValue placeholder={t('selectWithdrawalMethod')} /></SelectTrigger>
                <SelectContent className="bg-sky-800 border-sky-600 text-white">
                  {withdrawalMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="hover:bg-sky-700 focus:bg-sky-700">
                      <div className="flex items-center space-x-2"><span>{method.icon}</span><span>{method.label}</span></div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`phone-${balanceType}`} className="text-sky-200">{t('withdrawalPhoneNumber')}</Label>
              <Input id={`phone-${balanceType}`} type="tel" value={withdrawalData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+225 XX XX XX XX XX" className="bg-sky-500/10 border-sky-300/30 text-white placeholder:text-sky-300/50" />
              <p className="text-xs text-red-400">{t('ensureNumberCorrect')}</p>
            </div>
            <Button onClick={handleWithdrawal} disabled={loading || availableBalance < minWithdrawal} className="w-full bg-gradient-to-r from-green-500 to-sky-500 hover:from-green-600 hover:to-sky-600 text-white">
              {loading ? t('processingWithdrawal') : t('requestWithdrawal')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WithdrawalHistory = ({ userWithdrawals, loading, t }) => {
  const getStatusIcon = (status) => {
    if (status === 'pending') return <Clock className="h-4 w-4 text-yellow-400" />;
    if (status === 'completed' || status === 'confirmed') return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (status === 'rejected') return <AlertCircle className="h-4 w-4 text-red-400" />;
    return <Clock className="h-4 w-4 text-slate-400" />;
  };

  const getStatusText = (status) => {
    if (status === 'pending') return t('statusPending');
    if (status === 'completed') return t('statusCompleted');
    if (status === 'confirmed') return t('statusConfirmed');
    if (status === 'rejected') return t('statusRejected');
    return t('statusUnknown');
  };
  
  const getBalanceSourceText = (source) => {
    if (source === 'main') return t('withdrawableBalanceGeneral');
    if (source === 'youtube') return t('youtubeVideoBalance');
    if (source === 'tiktok') return t('tiktokVideoBalance');
    return t('unknownSource');
  }

  if (loading) {
    return <div className="flex justify-center items-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div></div>;
  }

  if (userWithdrawals.length === 0) {
    return <p className="text-center text-sky-200/70 py-8">{t('noWithdrawalHistory')}</p>;
  }

  return (
    <Card className="glass-effect border-sky-300/20 card-hover-sky">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sky-300"><History className="h-5 w-5" /><span>{t('withdrawalHistory')}</span></CardTitle>
        <CardDescription className="text-sky-200/70">{t('yourRecentWithdrawals')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {userWithdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-sky-500/10 rounded-lg border border-sky-300/30">
              <div className="flex items-center space-x-4">
                {getStatusIcon(withdrawal.status)}
                <div>
                  <p className="font-semibold text-sky-100">{withdrawal.amount.toLocaleString()} FCFA</p>
                  <p className="text-sm text-sky-200/80">
                    {new Date(withdrawal.requested_at).toLocaleDateString(t('lng'))} • {withdrawal.method}
                  </p>
                  <p className="text-xs text-sky-300/70">{t('source')}: {getBalanceSourceText(withdrawal.source)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  withdrawal.status === 'completed' || withdrawal.status === 'confirmed' ? 'text-green-300' :
                  withdrawal.status === 'pending' ? 'text-yellow-300' :
                  'text-red-300'
                }`}>{getStatusText(withdrawal.status)}</p>
                <p className="text-xs text-sky-200/80">{withdrawal.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


const Withdrawal = ({ user }) => {
  const { t } = useTranslation();
  const [userWithdrawals, setUserWithdrawals] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const minMainWithdrawal = 2500;
  const minVideoWithdrawal = 500;

  const fetchWithdrawalHistory = async () => {
    if (!user || !user.id) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });
      if (error) throw error;
      setUserWithdrawals(data || []);
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      toast({ title: t('error'), description: t('errorLoadingWithdrawalHistory'), variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalHistory();
  }, [user]);


  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-green-400 to-red-400 mb-4">{t('withdrawFunds')}</h1>
        <p className="text-sky-200/80 text-lg">{t('withdrawEasily')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-effect border-sky-300/20 card-hover-sky">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-sky-500/10 rounded-lg">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-sky-200/80">{t('withdrawableBalanceGeneral')}</p>
                <p className="text-2xl font-bold text-green-300">{(user.withdrawable_balance || 0).toLocaleString()} FCFA</p>
              </div>
              <div className="text-center p-4 bg-sky-500/10 rounded-lg">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Youtube className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-sky-200/80">{t('youtubeVideoBalance')}</p>
                <p className="text-2xl font-bold text-red-300">{(user.youtube_balance || 0).toLocaleString()} FCFA</p>
              </div>
              <div className="text-center p-4 bg-sky-500/10 rounded-lg">
                <div className="p-3 bg-gradient-to-r from-slate-500 to-purple-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <TikTokIcon />
                </div>
                <p className="text-sm text-sky-200/80">{t('tiktokVideoBalance')}</p>
                <p className="text-2xl font-bold text-purple-300">{(user.tiktok_balance || 0).toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-sky-500/10 border border-sky-300/30">
          <TabsTrigger value="main" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-200">{t('withdrawableBalanceGeneral')}</TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-sky-200">{t('youtubeVideoBalance')}</TabsTrigger>
          <TabsTrigger value="tiktok" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-sky-200">{t('tiktokVideoBalance')}</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-slate-500 data-[state=active]:text-white text-sky-200">{t('withdrawalHistory')}</TabsTrigger>
        </TabsList>
        <TabsContent value="main">
          <WithdrawalForm user={user} balanceType="main" availableBalance={user.withdrawable_balance || 0} minWithdrawal={minMainWithdrawal} onWithdrawalSuccess={fetchWithdrawalHistory} t={t} />
        </TabsContent>
        <TabsContent value="youtube">
          <WithdrawalForm user={user} balanceType="youtube" availableBalance={user.youtube_balance || 0} minWithdrawal={minVideoWithdrawal} onWithdrawalSuccess={fetchWithdrawalHistory} t={t} />
        </TabsContent>
        <TabsContent value="tiktok">
          <WithdrawalForm user={user} balanceType="tiktok" availableBalance={user.tiktok_balance || 0} minWithdrawal={minVideoWithdrawal} onWithdrawalSuccess={fetchWithdrawalHistory} t={t} />
        </TabsContent>
        <TabsContent value="history">
          <WithdrawalHistory userWithdrawals={userWithdrawals} loading={historyLoading} t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Withdrawal;
