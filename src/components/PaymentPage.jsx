
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Upload, CheckCircle, MessageSquare, Copy } from 'lucide-react';
import { processReferralCommissions } from '@/utils/referralSystem';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const PaymentPage = ({ user, onPaymentComplete }) => {
  const { t } = useTranslation();
  const [showManualPaymentDialog, setShowManualPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const supportWhatsappLink1 = "https://wa.me/qr/DBPMPKV6AXARN1";
  const supportWhatsappLink2 = "https://wa.me/qr/5HQBAXXEN6FIL1";
  const supportContactNumbers = "+237 698 357 887 / +237 6 95 64 51 69 (WhatsApp)";
  const automaticPaymentLink = "https://bpdymgew.mychariow.com/comment-avoir-disponible-pour-retrait";

  const handleAutomaticPayment = () => {
    window.open(automaticPaymentLink, '_blank');
    // Note: Actual automatic activation would require webhook integration from the payment provider.
    // For now, we'll show a toast and rely on the user to inform if activation fails.
    toast({
      title: t('redirectingToPayment'),
      description: t('followPaymentInstructions'),
    });
  };

  const handleManualPayment = () => {
    setShowManualPaymentDialog(true);
  };

  const openSupportChat = (link) => {
    window.open(link, '_blank');
  };

  const copySupportContact = () => {
    navigator.clipboard.writeText(supportContactNumbers);
    toast({ title: t('contactCopied'), description: t('supportContactCopied') });
  };

  // This function would ideally be triggered by a webhook from the payment provider
  // For simulation or if user confirms payment manually through support:
  const simulateAccountActivation = async () => {
    setLoading(true);
    try {
      const activatedAt = new Date().toISOString();
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ account_active: true, activated_at: activatedAt, payment_method: 'auto_simulated' })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      if (updatedUser.referred_by_code) {
        await processReferralCommissions(updatedUser.referred_by_code, updatedUser.id, supabase);
      }
      authLogin(updatedUser);
      toast({ title: t('paymentSuccess'), description: t('accountActivated') });
      onPaymentComplete(updatedUser);
    } catch (error) {
      console.error("Account activation error:", error);
      toast({ title: t('paymentError'), description: error.message || t('errorOccurred'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pattern-bg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
        <Card className="glass-effect border-white/10 card-hover">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl gradient-text">{t('activateYourAccount')}</CardTitle>
            <CardDescription>{t('payToActivate', { amount: 4000 })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{t('amountToPay')}</p><p className="text-2xl font-bold text-green-400">4000 FCFA</p></div>
                <div className="text-right"><p className="text-sm text-muted-foreground">{t('user')}</p><p className="font-semibold">{user.name}</p></div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Button onClick={handleAutomaticPayment} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <Smartphone className="h-4 w-4 mr-2" />{t('automaticPayment')}
              </Button>
              <Button onClick={handleManualPayment} variant="outline" className="border-white/20 hover:bg-white/5">
                <Upload className="h-4 w-4 mr-2" />{t('manualPayment')}
              </Button>
            </div>

            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-lg font-semibold text-blue-300 mb-2">{t('clickToActivateManual')}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={() => openSupportChat(supportWhatsappLink1)} className="bg-green-500 hover:bg-green-600">
                        <MessageSquare className="h-4 w-4 mr-2" /> {t('contactSupportWhatsApp')} 1
                    </Button>
                     <Button onClick={() => openSupportChat(supportWhatsappLink2)} className="bg-green-500 hover:bg-green-600">
                        <MessageSquare className="h-4 w-4 mr-2" /> {t('contactSupportWhatsApp')} 2
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t('support')}: {supportContactNumbers}</p>
            </div>

            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-lg font-semibold text-red-300 mb-2 uppercase">{t('ifAutoPaymentFails')}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={() => openSupportChat(supportWhatsappLink1)} className="bg-red-500 hover:bg-red-600">
                        <MessageSquare className="h-4 w-4 mr-2" /> {t('contactSupportWhatsApp')} 1
                    </Button>
                     <Button onClick={() => openSupportChat(supportWhatsappLink2)} className="bg-red-500 hover:bg-red-600">
                        <MessageSquare className="h-4 w-4 mr-2" /> {t('contactSupportWhatsApp')} 2
                    </Button>
                </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>💡 {t('automaticPaymentInstant')}</p>
              <p>📸 {t('manualPaymentVerification', { time: "2min max" })}</p>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showManualPaymentDialog} onOpenChange={setShowManualPaymentDialog}>
          <DialogContent className="glass-effect border-white/10">
            <DialogHeader><DialogTitle className="gradient-text">{t('manualPayment')}</DialogTitle><DialogDescription>{t('manualPaymentInstructionsTitle')}</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-400 mb-2">{t('cameroonPaymentInstructions')}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('orangeMoneyInstructionsCM')} <strong className="text-yellow-300">#150*1*1*698357887*4000#</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('mtnMoneyInstructionsCM')} <strong className="text-yellow-300">*126#</strong>, {t('thenSelect')} 1, {t('enterNumber')} <strong className="text-yellow-300">673455996</strong>.
                </p>
                <p className="text-sm text-muted-foreground mt-3 font-semibold">{t('afterPaymentContactSupport')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => openSupportChat(supportWhatsappLink1)} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <MessageSquare className="h-4 w-4 mr-2" />{t('contactSupportWhatsApp')} 1
                </Button>
                <Button onClick={() => openSupportChat(supportWhatsappLink2)} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <MessageSquare className="h-4 w-4 mr-2" />{t('contactSupportWhatsApp')} 2
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
