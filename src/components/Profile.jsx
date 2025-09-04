
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Shield, Edit2, Save, X, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const Profile = ({ user: initialUser }) => {
  const { t } = useTranslation();
  const { user, updateUser: updateAuthContextUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [referrerUsername, setReferrerUsername] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      });

      const fetchReferrer = async () => {
        if (user.referred_by_code) {
          try {
            const { data: referrerData, error } = await supabase
              .from('users')
              .select('username')
              .eq('referral_code', user.referred_by_code)
              .single();
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
            if (referrerData) {
              setReferrerUsername(referrerData.username);
            }
          } catch (err) {
            console.error("Error fetching referrer username:", err);
            setReferrerUsername(t('referrerNotFound'));
          }
        }
        setDataLoading(false);
      };
      fetchReferrer();
    } else {
      setDataLoading(false);
    }
  }, [user, t]);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast({ title: t('error'), description: t('requiredField'), variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: t('error'), description: t('invalidEmail'), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          // Email update requires Supabase Auth handling if it's the primary email.
          // For simplicity, we'll assume it's just a data field here or handle separately.
          // email: formData.email, 
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      updateAuthContextUser(updatedUser); 
      setIsEditing(false);
      toast({ title: t('profileUpdated'), description: t('yourInfoSaved') });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ title: t('error'), description: error.message || t('profileUpdateError'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({ name: user.name, phone: user.phone, email: user.email });
    }
    setIsEditing(false);
  };
  
  if (dataLoading || !user) {
    return <div className="flex justify-center items-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div></div>;
  }

  const profileInfo = [
    { label: t('username'), value: user.username, icon: User, editable: false },
    { label: t('fullName'), value: isEditing ? formData.name : user.name, icon: User, editable: true, name: "name" },
    { label: t('phoneNumber'), value: isEditing ? formData.phone : user.phone, icon: Phone, editable: true, name: "phone" },
    { label: t('emailAddress'), value: isEditing ? formData.email : user.email, icon: Mail, editable: true, name: "email" }, // Consider Supabase Auth for email change
    { label: t('dateRegistered'), value: new Date(user.created_at).toLocaleDateString(t('lng')), icon: Calendar, editable: false },
    { label: t('accountStatus'), value: user.account_active ? t('active') : t('pending'), icon: Shield, editable: false }
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-green-400 to-red-400 mb-4">{t('myProfile')}</h1>
        <p className="text-sky-200/80 text-lg">{t('managePersonalInfo')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-effect border-sky-300/20 card-hover-sky">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-sky-300">
                  <User className="h-5 w-5" />
                  <span>{t('personalInformation')}</span>
                </CardTitle>
                <CardDescription className="text-sky-200/70">{t('yourAccountData')}</CardDescription>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-sky-400 text-sky-300 hover:bg-sky-400/20">
                    <Edit2 className="h-4 w-4 mr-2" /> {t('edit')}
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} size="sm" className="bg-green-500 hover:bg-green-600 text-white" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" /> {loading ? t('saving') : t('save')}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="border-red-400 text-red-300 hover:bg-red-400/20" disabled={loading}>
                      <X className="h-4 w-4 mr-2" /> {t('cancel')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {profileInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex items-center space-x-4 p-4 bg-sky-500/10 rounded-lg border border-sky-300/30"
                  >
                    <div className="p-2 bg-gradient-to-r from-sky-500 to-green-500 rounded-full">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-sky-200/80">{info.label}</Label>
                      {isEditing && info.editable ? (
                        <Input name={info.name} value={info.value} onChange={handleChange} className="mt-1 bg-sky-400/10 border-sky-300/40 text-white" />
                      ) : (
                        <p className="text-lg font-semibold mt-1 text-sky-100">
                          {info.value}
                          {info.label === t('accountStatus') && (
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              user.account_active ? 'bg-green-500/30 text-green-300' : 'bg-yellow-500/30 text-yellow-300'
                            }`}>
                              {user.account_active ? `✓ ${t('active')}` : `⏳ ${t('pending')}`}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-effect border-sky-300/20 card-hover-sky">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sky-300">
              <LinkIcon className="h-5 w-5" />
              <span>{t('yourReferralCode')}</span>
            </CardTitle>
            <CardDescription className="text-sky-200/70">{t('yourUniqueCode')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-sky-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-200/80">{t('yourReferralCode')}</p>
                  <p className="text-2xl font-bold font-mono text-green-300">{user.referral_code}</p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(user.referral_code);
                    toast({ title: t('copied'), description: t('yourReferralCode') + ' ' + t('copied') });
                  }}
                  variant="outline"
                  size="sm"
                  className="border-green-400 text-green-300 hover:bg-green-400/20"
                >
                  {t('copy')}
                </Button>
              </div>
            </div>
            {user.referred_by_code && (
               <div className="mt-4 p-4 bg-sky-500/10 border border-sky-300/30 rounded-lg">
                <p className="text-sm text-sky-200/80">{t('referredBy')}</p>
                <p className="text-xl font-semibold text-sky-100">{referrerUsername || user.referred_by_code}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
