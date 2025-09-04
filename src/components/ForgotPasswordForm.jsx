import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mail, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Erreur", description: "Veuillez entrer votre adresse email.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setMessageSent(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // Your reset password page
      });
      if (error) throw error;
      setMessageSent(true);
      toast({ title: "Email envoyé", description: "Si un compte existe pour cet email, vous recevrez un lien pour réinitialiser votre mot de passe." });
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({ title: "Erreur", description: error.message || "Impossible d'envoyer l'email de réinitialisation.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pattern-bg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Card className="glass-effect border-white/10 card-hover">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl gradient-text">Mot de passe oublié</CardTitle>
            <CardDescription>Entrez votre email pour réinitialiser votre mot de passe.</CardDescription>
          </CardHeader>
          <CardContent>
            {messageSent ? (
              <div className="text-center space-y-4">
                <p className="text-green-400">Un email de réinitialisation a été envoyé à <span className="font-bold">{email}</span>. Veuillez vérifier votre boîte de réception (et vos spams).</p>
                <Link to="/login">
                  <Button variant="outline">Retour à la connexion</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="relative">
                    <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="bg-white/5 border-white/10 pr-10" />
                    <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" disabled={loading}>
                  {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                </Button>
              </form>
            )}
            {!messageSent && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <Link to="/login">
                        <Button variant="link" className="p-0 h-auto font-semibold text-primary">
                        Se connecter
                        </Button>
                    </Link>
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordForm;