
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Gift, Youtube, Copy, Share2, Video, Users2, KeyRound as UsersRound } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { generateReferralLink, getUserReferrals, calculateBonusEligibility } from '@/utils/referralSystem';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.528 8.528c3.056 0 4.664 2.112 4.664 4.664S15.584 17.856 12.528 17.856s-4.664-2.112-4.664-4.664c0-.048.016-.08.016-.128.08-2.336 1.856-4.416 4.648-4.528Z"/><path d="M17.192 8.528V4.8H20.8v6.464A4.656 4.656 0 0 1 16.144 16H8.256V4.8h3.632v3.728"/>
  </svg>
);

const Dashboard = ({ user }) => {
  const { t } = useTranslation();
  const [referrals, setReferrals] = useState([]);
  const [bonusInfo, setBonusInfo] = useState({
    currentReferrals: 0,
    bonusEligible: false,
    bonusAmount: 700,
    remainingReferrals: 15, // Updated target
    targetReferrals: 15
  });
  const [loading, setLoading] = useState(true);
  const [referralCounts, setReferralCounts] = useState({ level1: 0, level2: 0, level3: 0 });

  const referralLink = user ? generateReferralLink(user.referral_code) : '';

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.id) {
        setLoading(true);
        const userReferralsData = await getUserReferrals(user.id);
        const eligibility = await calculateBonusEligibility(user.id);
        setReferrals(userReferralsData);
        setBonusInfo(eligibility);
        setReferralCounts(user.referral_counts || { level1: 0, level2: 0, level3: 0 });
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: t('copied'),
      description: t('yourReferralLink') + ' ' + t('copied')
    });
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: t('joinSuperearn'),
        text: t('landingSubtitle'),
        url: referralLink
      }).catch(err => console.error("Share failed", err));
    } else {
      copyReferralLink();
    }
  };

  const videoSchedule = [
    { day: t('monday'), tiktok: '✓', youtube: '', time: t('from10AM') },
    { day: t('tuesday'), tiktok: '', youtube: '', time: '' },
    { day: t('wednesday'), tiktok: '', youtube: '✓', time: t('from10AM') },
    { day: t('thursday'), tiktok: '', youtube: '', time: '' },
    { day: t('friday'), tiktok: '✓', youtube: '', time: t('from10AM') },
    { day: t('saturday'), tiktok: '', youtube: '', time: '' },
    { day: t('sunday'), tiktok: '', youtube: '✓', time: t('from10AM') },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    );
  }
  
  const stats = [
    {
      title: t('affiliationFeePaid'),
      value: `${(user.affiliation_fee || 0).toLocaleString()} FCFA`,
      icon: DollarSign,
      color: "from-green-500 to-green-600"
    },
    {
      title: t('totalEarnedBalance'),
      value: `${(user.balance || 0).toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: "from-sky-500 to-sky-600"
    },
    {
      title: t('totalWithdrawals'),
      value: `${(user.total_withdrawals || 0).toLocaleString()} FCFA`,
      icon: DollarSign,
      color: "from-red-500 to-red-600"
    },
    {
      title: t('withdrawableBalance'),
      value: `${(user.withdrawable_balance || 0).toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: t('youtubeVideoBalance'),
      value: `${(user.youtube_balance || 0).toLocaleString()} FCFA`,
      icon: Youtube,
      color: "from-red-600 to-red-700"
    },
    {
      title: t('tiktokVideoBalance'),
      value: `${(user.tiktok_balance || 0).toLocaleString()} FCFA`,
      icon: TikTokIcon,
      color: "from-slate-600 to-slate-700"
    },
    {
      title: t('welcomeBonusBalance'),
      value: `${(user.welcome_bonus || 0).toLocaleString()} FCFA`,
      icon: Gift,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: t('referralsLevel1'),
      value: referralCounts.level1,
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: t('referralsLevel2'),
      value: referralCounts.level2,
      icon: Users2,
      color: "from-pink-500 to-pink-600"
    },
    {
      title: t('referralsLevel3'),
      value: referralCounts.level3,
      icon: UsersRound,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-sky-500/80 border-sky-400/50 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              {t('helloUser', { username: user.username })}
            </CardTitle>
            <CardDescription className="text-sky-100/90 text-md">
              {t('dashboardOverview')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-green-300" />
              <div>
                <p className="text-sm text-sky-100/80">{t('affiliationFeePaid')}</p>
                <p className="text-xl font-semibold">{(user.affiliation_fee || 0).toLocaleString()} FCFA</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-sky-300" />
              <div>
                <p className="text-sm text-sky-100/80">{t('totalEarnedBalance')}</p>
                <p className="text-xl font-semibold">{(user.balance || 0).toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.slice(2).map((stat, index) => { 
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="glass-effect border-sky-300/20 card-hover-sky">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-sky-200/80">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mt-2 text-sky-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {!bonusInfo.bonusEligible && user.welcome_bonus === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-sky-300/20 card-hover-sky">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-400">
                <Gift className="h-5 w-5" />
                <span>{t('bonusProgress')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-sky-100/90">
                  <span>{t('currentReferrals', { count: bonusInfo.currentReferrals })}</span>
                  <span>{t('remaining', { count: bonusInfo.remainingReferrals })}</span>
                </div>
                <div className="w-full bg-sky-300/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(bonusInfo.currentReferrals / bonusInfo.targetReferrals) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-sky-200/80">
                  {t('inviteMoreToUnlock', { count: bonusInfo.remainingReferrals, target: bonusInfo.targetReferrals })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {referrals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-sky-300/20 card-hover-sky">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sky-300">
                <Users className="h-5 w-5" />
                <span>{t('yourRecentReferrals')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.slice(0, 5).map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 bg-sky-500/10 rounded-lg">
                    <div>
                      <p className="font-semibold text-sky-100">{referral.referred_user?.name || t('user')}</p>
                      <p className="text-sm text-sky-200/80">
                        {t('level', { level: referral.level })} • {new Date(referral.created_at).toLocaleDateString(t('lng'))}
                      </p>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-effect border-sky-300/20 card-hover-sky">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sky-300">
              <Share2 className="h-5 w-5" />
              <span>{t('yourReferralLink')}</span>
            </CardTitle>
            <CardDescription className="text-sky-200/80">
              {t('shareLinkToEarn')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 p-3 bg-sky-500/10 rounded-lg border border-sky-300/30">
                <p className="text-sm font-mono break-all text-sky-100">{referralLink}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyReferralLink} variant="outline" size="sm" className="border-sky-400 text-sky-300 hover:bg-sky-400/20">
                  <Copy className="h-4 w-4 mr-2" />
                  {t('copy')}
                </Button>
                <Button onClick={shareReferralLink} size="sm" className="bg-sky-500 hover:bg-sky-600">
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('share')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-effect border-sky-300/20 card-hover-sky">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sky-300">
              <Video className="h-5 w-5" />
              <span>{t('videoWatchingSchedule')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-sky-300/30">
                  <TableHead className="text-sky-200">{t('date')}</TableHead>
                  <TableHead className="text-sky-200">{t('tiktokVideos')}</TableHead>
                  <TableHead className="text-sky-200">{t('youtubeVideos')}</TableHead>
                  <TableHead className="text-sky-200">{t('time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videoSchedule.map((item) => (
                  <TableRow key={item.day} className="border-sky-300/30">
                    <TableCell className="font-medium text-sky-100">{item.day}</TableCell>
                    <TableCell className="text-center text-sky-100">{item.tiktok ? <TikTokIcon /> : '-'}</TableCell>
                    <TableCell className="text-center text-sky-100">{item.youtube ? <Youtube className="text-red-500 inline"/> : '-'}</TableCell>
                    <TableCell className="text-sky-100">{item.time || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>


    </div>
  );
};

export default Dashboard;
