import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gift, Users, CheckCircle, AlertCircle, Trophy, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { calculateBonusEligibility, getUserReferrals } from '@/utils/referralSystem';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const BonusClaim = ({ user }) => {
  const { t } = useTranslation();
  const { updateUser: updateAuthContextUser } = useAuth();
  const [bonusInfo, setBonusInfoState] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) {
        setDataLoading(false);
        return;
      }
      setDataLoading(true);
      try {
        const eligibility = await calculateBonusEligibility(user.id);
        const userReferrals = await getUserReferrals(user.id);
        
        setBonusInfoState(eligibility);
        setReferrals(userReferrals);

        const { data: claimed, error } = await supabase
          .from('claimed_bonuses')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'welcome')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        setBonusClaimed(!!claimed);

      } catch (err) {
        console.error("Error fetching bonus data:", err);
        toast({ title: t('error'), description: "Impossible de charger les données du bonus.", variant: "destructive" });
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user, t]);

  const claimBonus = async () => {
    if (!bonusInfo?.bonusEligible || bonusClaimed || !user) return;
    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('claimed_bonuses')
        .insert({
          user_id: user.id,
          type: 'welcome',
          amount: bonusInfo.bonusAmount
        });
      if (insertError) throw insertError;

      const newWelcomeBonus = (user.welcome_bonus || 0) + bonusInfo.bonusAmount;
      const newBalance = (user.balance || 0) + bonusInfo.bonusAmount;
      const newWithdrawableBalance = (user.withdrawable_balance || 0) + bonusInfo.bonusAmount;

      const { data: updatedUser, error: updateUserError } = await supabase
        .from('users')
        .update({
          welcome_bonus: newWelcomeBonus,
          balance: newBalance,
          withdrawable_balance: newWithdrawableBalance
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateUserError) throw updateUserError;

      updateAuthContextUser(updatedUser); 
      setBonusClaimed(true);
      toast({ title: t('bonusClaimedSuccessfully'), description: t('congratulationsAmountAdded', { amount: bonusInfo.bonusAmount }) });
    } catch (error) {
      console.error("Bonus claim error:", error);
      toast({ title: t('error'), description: error.message || "Impossible de réclamer le bonus.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <div className="flex justify-center items-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div></div>;
  }
  if (!bonusInfo) return <p className="text-center text-sky-200/80">{t('error')}</p>;

  const directActiveReferrals = referrals.filter(r => r.level === 1 && r.referredUser?.account_active);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-green-400 to-red-400 mb-4">{t('claimBonusTitle')}</h1>
        <p className="text-sky-200/80 text-lg">{t('earnBonusesByReferring')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-effect border-sky-300/20 card-hover-sky">
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              bonusInfo.bonusEligible ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-slate-600 to-slate-700'
            }`}>
              {bonusInfo.bonusEligible ? <Trophy className="h-8 w-8 text-white" /> : <Gift className="h-8 w-8 text-white" />}
            </div>
            <CardTitle className="text-2xl text-sky-100">
              {bonusClaimed ? <span className="text-green-400">{t('bonusAlreadyClaimed')}</span>
                : bonusInfo.bonusEligible ? <span className="text-yellow-400">{t('bonusAvailable')}</span>
                : <span>{t('welcomeBonus')}</span>}
            </CardTitle>
            <CardDescription className="text-lg text-sky-200/80">
              {bonusClaimed ? t('youAlreadyClaimedWelcomeBonus')
                : bonusInfo.bonusEligible ? t('claimYourBonusNow', { amount: bonusInfo.bonusAmount })
                : t('referMoreToUnlockBonus', { count: bonusInfo.remainingReferrals })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-sky-100/90">
                  <span>{t('progression', { current: bonusInfo.currentReferrals, total: bonusInfo.targetReferrals })}</span>
                  <span>{Math.round((bonusInfo.currentReferrals / bonusInfo.targetReferrals) * 100)}%</span>
                </div>
                <div className="w-full bg-sky-300/20 rounded-full h-3">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                       style={{ width: `${Math.min((bonusInfo.currentReferrals / bonusInfo.targetReferrals) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-sky-200/80 mb-2">{t('bonusAmount')}</p>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">{bonusInfo.bonusAmount} FCFA</p>
              </div>
              {!bonusClaimed && (
                <Button onClick={claimBonus} disabled={!bonusInfo.bonusEligible || loading}
                        className={`w-full ${bonusInfo.bonusEligible ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' : 'bg-slate-600 cursor-not-allowed text-slate-400'}`}>
                  {loading ? t('claiming') : bonusInfo.bonusEligible ? <><Gift className="h-4 w-4 mr-2" />{t('claimMyBonus')}</> : <><AlertCircle className="h-4 w-4 mr-2" />{t('bonusNotAvailable')}</>}
                </Button>
              )}
              {bonusClaimed && (
                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-semibold">{t('bonusClaimedSuccessfully')}</p>
                  <p className="text-sm text-sky-200/80">{t('congratulationsAmountAdded', { amount: bonusInfo.bonusAmount })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-effect border-sky-300/20 card-hover-sky">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sky-300"><Star className="h-5 w-5 text-sky-400" /><span>{t('bonusConditions')}</span></CardTitle>
            <CardDescription className="text-sky-200/70">{t('howToUnlockWelcomeBonus')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { text: t('conditionRefer15'), desc: t('conditionRefer15Desc'), met: bonusInfo.currentReferrals >= bonusInfo.targetReferrals },
                { text: t('conditionActivatedAccounts'), desc: t('conditionActivatedAccountsDesc'), met: bonusInfo.currentReferrals >= bonusInfo.targetReferrals }, 
                { text: t('conditionClaimBonus'), desc: t('conditionClaimBonusDesc'), met: !bonusClaimed }
              ].map((cond, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${cond.met ? (i === 2 && !bonusClaimed ? 'bg-yellow-500' : 'bg-green-500') : 'bg-slate-500'}`}>
                    {i === 2 ? <Gift className="h-4 w-4 text-white" /> : <CheckCircle className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sky-100">{cond.text}</p>
                    <p className="text-sm text-sky-200/80">{cond.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {directActiveReferrals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect border-sky-300/20 card-hover-sky">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sky-300"><Users className="h-5 w-5 text-sky-400" /><span>{t('yourReferralsCount', { count: directActiveReferrals.length, total: bonusInfo.targetReferrals })}</span></CardTitle>
              <CardDescription className="text-sky-200/70">{t('listOfDirectReferrals')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {directActiveReferrals.map((referral, index) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 bg-sky-500/10 rounded-lg border border-sky-300/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{index + 1}</div>
                      <div>
                        <p className="font-semibold text-sky-100">{referral.referredUser?.name || t('user')}</p>
                        <p className="text-sm text-sky-200/80">{new Date(referral.created_at).toLocaleDateString(t('lng'))}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">+{referral.commission} FCFA</p>
                      <p className="text-xs text-sky-200/80">{t('commission')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default BonusClaim;