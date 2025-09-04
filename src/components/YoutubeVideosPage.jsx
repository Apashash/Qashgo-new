
import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Youtube as YoutubeIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const YOUTUBE_VIDEO_IDS = ['sn3nlzbzQBU', 'J0h9ICvu1xI']; 
const WATCH_TIME_REQUIREMENT = 60; // 60 seconds
const EARNING_AMOUNT = 50;

const YoutubeVideoPlayer = ({ videoId, onWatched, user, t }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WATCH_TIME_REQUIREMENT);
  const [isEligible, setIsEligible] = useState(false);
  const [hasEarned, setHasEarned] = useState(false);
  const intervalRef = useRef(null);

  const playerOpts = {
    height: '300',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft <= 0 && !hasEarned) {
      setIsPlaying(false);
      setIsEligible(true);
      if(player) player.pauseVideo();
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, timeLeft, hasEarned, player]);

  const handlePlay = () => {
    if (!hasEarned && timeLeft > 0) {
      setIsPlaying(true);
    }
  };
  
  const handlePause = () => setIsPlaying(false);
  const handleEnd = () => setIsPlaying(false);

  const claimEarning = async () => {
    if (!isEligible || hasEarned) return;
    try {
      setHasEarned(true);
      await onWatched(videoId, EARNING_AMOUNT);
      toast({ title: t('success'), description: t('earnedAmount', {amount: EARNING_AMOUNT}) });
    } catch (error) {
      console.error("Error claiming earning:", error);
      toast({ title: t('error'), description: error.message || "Failed to claim earning.", variant: 'destructive' });
      setHasEarned(false); // Allow retry
    }
  };

  const onReady = (event) => setPlayer(event.target);

  return (
    <Card className="glass-effect border-sky-300/20 card-hover-sky">
      <CardContent className="p-4">
        <div className="aspect-video mb-4 rounded-lg overflow-hidden">
          {videoId ? <YouTube videoId={videoId} opts={playerOpts} onReady={onReady} onPlay={handlePlay} onPause={handlePause} onEnd={handleEnd} className="w-full h-full"/> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-sky-300">{t('videoNotAvailable')}</div> }
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
              <Button onClick={() => player?.playVideo()} disabled={isPlaying || !videoId} className="w-full bg-sky-500 hover:bg-sky-600">
                <YoutubeIcon className="h-4 w-4 mr-2" /> {timeLeft < WATCH_TIME_REQUIREMENT && timeLeft > 0 ? t('continueWatching') : t('startWatching')}
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


const YoutubeVideosPage = ({ user }) => {
  const { updateUser: updateAuthContextUser } = useAuth();
  const { t } = useTranslation();

  const handleVideoWatched = async (videoId, amount) => {
    const newYoutubeBalance = (user.youtube_balance || 0) + amount;
    const newBalance = (user.balance || 0) + amount;
    let newWithdrawableBalance = user.withdrawable_balance || 0;
    if (newYoutubeBalance >= 500) { 
        newWithdrawableBalance += amount; 
    }


    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
          youtube_balance: newYoutubeBalance,
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
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 mb-4">
          <YoutubeIcon className="inline-block h-10 w-10 mr-2 text-red-500" />
          {t('youtubeVideosPageTitle')}
        </h1>
        <p className="text-sky-200/80 text-lg">{t('watchAndEarnYoutube')}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {YOUTUBE_VIDEO_IDS.map((videoId) => (
          <motion.div key={videoId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <YoutubeVideoPlayer videoId={videoId} onWatched={handleVideoWatched} user={user} t={t} />
          </motion.div>
        ))}
      </div>
      
      <Card className="glass-effect border-red-400/30">
        <CardHeader>
          <CardTitle className="text-red-300">{t('withdrawalThreshold')}</CardTitle>
          <CardDescription className="text-red-200/80">{t('youtubeVideoBalance')}: {user.youtube_balance || 0} FCFA. {t('minimumWithdrawalVideo', {amount: 500})}</CardDescription>
        </CardHeader>
        <CardContent>
           {user.youtube_balance >= 500 ? (
             <div className="flex items-center text-green-400">
               <CheckCircle className="h-5 w-5 mr-2" />
<span>{t('withdrawalThresholdMet')}</span>
             </div>
           ) : (
             <div className="flex items-center text-orange-400">
               <AlertCircle className="h-5 w-5 mr-2" />
               <span>{t('earnMoreToWithdraw', {amount: 500 - (user.youtube_balance || 0)})}</span>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YoutubeVideosPage;
