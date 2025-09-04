
import { supabase } from '@/lib/supabaseClient'; 

export const generateReferralCode = (username) => {
  return username.toUpperCase().replace(/\s+/g, '');
};

export const generateReferralLink = (referralCode) => {
  return `${window.location.origin}/register?ref=${referralCode}`;
};

export const calculateCommissions = (level, amount = 4000) => {
  const commissions = {
    1: 1800, 
    2: 900,  
    3: 500   
  };
  return commissions[level] || 0;
};

export const processReferralCommissions = async (referrerCode, newUserId) => {
  if (!referrerCode) return;

  try {
    const { data: referrerL1, error: referrerL1Error } = await supabase
      .from('users')
      .select('id, referred_by_code, balance, withdrawable_balance, referral_code') // Added referral_code for L1
      .eq('referral_code', referrerCode) 
      .single();

    if (referrerL1Error || !referrerL1) {
      console.error('Referrer L1 not found or error:', referrerL1Error);
      return;
    }

    const commissionL1 = calculateCommissions(1);
    await supabase.from('referrals').insert({
      referrer_id: referrerL1.id,
      referred_id: newUserId,
      level: 1,
      commission: commissionL1,
      paid: true 
    });
    await supabase.from('users').update({
      balance: (referrerL1.balance || 0) + commissionL1,
      withdrawable_balance: (referrerL1.withdrawable_balance || 0) + commissionL1
    }).eq('id', referrerL1.id);


    if (referrerL1.referred_by_code) {
      const { data: referrerL2, error: referrerL2Error } = await supabase
        .from('users')
        .select('id, referred_by_code, balance, withdrawable_balance, referral_code') // Added referral_code for L2
        .eq('referral_code', referrerL1.referred_by_code)
        .single();

      if (referrerL2 && !referrerL2Error) {
        const commissionL2 = calculateCommissions(2);
        await supabase.from('referrals').insert({
          referrer_id: referrerL2.id,
          referred_id: newUserId, 
          level: 2,
          commission: commissionL2,
          paid: true
        });
        await supabase.from('users').update({
          balance: (referrerL2.balance || 0) + commissionL2,
          withdrawable_balance: (referrerL2.withdrawable_balance || 0) + commissionL2
        }).eq('id', referrerL2.id);

        if (referrerL2.referred_by_code) {
          const { data: referrerL3, error: referrerL3Error } = await supabase
            .from('users')
            .select('id, balance, withdrawable_balance') // L3 doesn't need to refer further for this chain
            .eq('referral_code', referrerL2.referred_by_code)
            .single();
          
          if (referrerL3 && !referrerL3Error) {
            const commissionL3 = calculateCommissions(3);
            await supabase.from('referrals').insert({
              referrer_id: referrerL3.id,
              referred_id: newUserId, 
              level: 3,
              commission: commissionL3,
              paid: true
            });
            await supabase.from('users').update({
              balance: (referrerL3.balance || 0) + commissionL3,
              withdrawable_balance: (referrerL3.withdrawable_balance || 0) + commissionL3
            }).eq('id', referrerL3.id);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing referral commissions:', error);
  }
};


export const getUserReferrals = async (userId) => {
  try {
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred_user:users!referrals_referred_id_fkey (
          username,
          name,
          email,
          account_active
        )
      `)
      .eq('referrer_id', userId);

    if (error) throw error;
    
    return referrals.map(r => ({
      ...r,
      referredUser: r.referred_user 
    }));

  } catch (error) {
    console.error('Error fetching user referrals:', error);
    return [];
  }
};

export const calculateBonusEligibility = async (userId) => {
  const WELCOME_BONUS_REFERRAL_TARGET = 15; // Updated target
  try {
    const userReferrals = await getUserReferrals(userId);
    const directActiveReferrals = userReferrals.filter(r => r.level === 1 && r.referredUser?.account_active);
    
    return {
      currentReferrals: directActiveReferrals.length,
      bonusEligible: directActiveReferrals.length >= WELCOME_BONUS_REFERRAL_TARGET,
      bonusAmount: 700,
      remainingReferrals: Math.max(0, WELCOME_BONUS_REFERRAL_TARGET - directActiveReferrals.length),
      targetReferrals: WELCOME_BONUS_REFERRAL_TARGET,
    };
  } catch (error) {
    console.error('Error calculating bonus eligibility:', error);
    return {
      currentReferrals: 0,
      bonusEligible: false,
      bonusAmount: 700,
      remainingReferrals: WELCOME_BONUS_REFERRAL_TARGET,
      targetReferrals: WELCOME_BONUS_REFERRAL_TARGET,
    };
  }
};
