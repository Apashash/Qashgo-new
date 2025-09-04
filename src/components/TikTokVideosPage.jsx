
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const TIKTOK_EMBED_CODES = [
  `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@tiktok/video/ZMSUq42fq" data-video-id="ZMSUq42fq" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@tiktok" href="https://www.tiktok.com/@tiktok?refer=embed">@tiktok</a> <p></p> <a target="_blank" title="♬ original sound - TikTok" href="https://www.tiktok.com/music/original-sound-ZMSUq42fq?refer=embed">♬ original sound - TikTok</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>`,
  `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@tiktok/video/tiktoklite" data-video-id="tiktoklite" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@tiktok" href="https://www.tiktok.com/@tiktok?refer=embed">@tiktok</a> <p>TikTok Lite</p> <a target="_blank" title="♬ original sound - TikTok Lite" href="https://www.tiktok.com/music/original-sound-tiktoklite?refer=embed">♬ original sound - TikTok Lite</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>`
];

const WATCH_TIME_REQUIREMENT = 60; // 60 seconds
const EARNING_AMOUNT = 50;

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.528 8.528c3.056 0 4.664 2.112 4.664 4.664S15.584 17.856 12.528 17.856s-4.664-2.112-4.664-4.664c0-.048.016-.08.016-.128.08-2.336 1.856-4.416 4.648-4.528Z"/><path d="M17.192 8.528V4.8H20.8v6.464A4.656 4.656 0 0 1 16.144 16H8.256V4.8h3.632v3.728"/>
  </svg>
);


const TikTokVideoPlayer = ({ embedCode, videoId, onWatched, user, t }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WATCH_TIME_REQUIREMENT);
  const [isEligible, setIsEligible] = useState(false);
  const [hasEarned, setHasEarned] = useState(false);
  const intervalRef = useRef(null);
  const embedContainerRef = useRef(null);

  useEffect(() => {
    if (embedContainerRef.current && embedCode) {
        embedContainerRef.current.innerHTML = embedCode;
        if (window.tiktok && typeof window.tiktok.embed === 'function') {
            window.tiktok.embed();
        } else {
            const script = document.createElement('script');
            script.src = "https://www.tiktok.com/embed.js";
            script.async = true;
            document.body.appendChild(script);
            return () => { document.body.removeChild(script); };
        }
    }
  }, [embedCode]);


  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft <= 0 && !hasEarned) {
      setIsPlaying(false);
      setIsEligible(true);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, timeLeft, hasEarned]);

  const handleStartWatching = () => {
    if (!hasEarned && timeLeft > 0) {
      setIsPlaying(true);
    }
  };

  const claimEarning = async () => {
    if (!isEligible || hasEarned) return;
    try {
      setHasEarned(true);
      await onWatched(videoId, EARNING_AMOUNT);
      toast({ title: t('success'), description: t('earnedAmount', {amount: EARNING_AMOUNT}) });
    } catch (error) {
      console.error("Error claiming earning:", error);
      toast({ title: t('error'), description: error.message || "Failed to claim earning.", variant: 'destructive' });
      setHasEarned(false); 
    }
  };

  return (
    <Card className="glass-effect border-sky-300/20 card-hover-sky">
      <CardContent className="p-4">
        <div ref={embedContainerRef} className="aspect-[9/16] sm:aspect-video mb-4 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
          {!embedCode && <p className="text-sky-300">{t('videoNotAvailable')}</p>}
        </div>
        {!hasEarned && (
          <>
            <p className="text-sm text-sky-200/80 mb-2">{t('watchVideoFor1Min', {amount: EARNING_AMOUNT})}</p>
            {isPlaying && timeLeft > 0 && (
              <div className="flex items-center text-orange-400 mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>{t('timeLeft', {seconds: timeLeft})}</span>
              </div>
            )}
            {isEligible ? (
              <Button onClick={claimEarning} className="w-full bg-green-500 hover:bg-green-600">
                <CheckCircle className="h-4 w-4 mr-2" /> {t('claimMyBonus')} {EARNING_AMOUNT} FCFA
              </Button>
            ) : (
              <Button onClick={handleStartWatching} disabled={isPlaying || !embedCode} className="w-full bg-sky-500 hover:bg-sky-600">
                <TikTokIcon /> <span className="ml-2">{timeLeft < WATCH_TIME_REQUIREMENT && timeLeft > 0 ? t('continueWatching') : t('startWatching')}</span>
              </Button>
            )}
          </>
        )}
        {hasEarned && (
          <div className="text-center p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-1" />
            <p className="text-green-300 font-semibold">{t('earnedAmount', {amount: EARNING_AMOUNT})}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


const TikTokVideosPage = ({ user }) => {
  const { updateUser: updateAuthContextUser } = useAuth();
  const { t } = useTranslation();

  const handleVideoWatched = async (videoId, amount) => {
    const newTiktokBalance = (user.tiktok_balance || 0) + amount;
    const newBalance = (user.balance || 0) + amount;
    let newWithdrawableBalance = user.withdrawable_balance || 0;

    if (newTiktokBalance >= 500) {
        newWithdrawableBalance += amount;
    }
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
          tiktok_balance: newTiktokBalance,
          balance: newBalance,
          withdrawable_balance: newWithdrawableBalance,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    updateAuthContextUser(updatedUser);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-pink-500 to-purple-500 mb-4">
          <TikTokIcon /> <span className="ml-2">{t('tiktokVideosPageTitle')}</span>
        </h1>
        <p className="text-sky-200/80 text-lg">{t('watchAndEarnTiktok')}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {TIKTOK_EMBED_CODES.map((embedCode, index) => (
          <motion.div key={`tiktok-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
            <TikTokVideoPlayer embedCode={embedCode} videoId={`tiktok-${index}`} onWatched={handleVideoWatched} user={user} t={t} />
          </motion.div>
        ))}
      </div>
      <Card className="glass-effect border-purple-400/30">
        <CardHeader>
          <CardTitle className="text-purple-300">{t('withdrawalThreshold')}</CardTitle>
          <CardDescription className="text-purple-200/80">{t('tiktokVideoBalance')}: {user.tiktok_balance || 0} FCFA. {t('minimumWithdrawalVideo', {amount: 500})}</CardDescription>
        </CardHeader>
        <CardContent>
           {user.tiktok_balance >= 500 ? (
             <div className="flex items-center text-green-400">
               <CheckCircle className="h-5 w-5 mr-2" />
               <span>{t('withdrawalThresholdMet')}</span>
             </div>
           ) : (
             <div className="flex items-center text-orange-400">
               <AlertCircle className="h-5 w-5 mr-2" />
               <span>{t('earnMoreToWithdraw', {amount: 500 - (user.tiktok_balance || 0)})}</span>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TikTokVideosPage;
