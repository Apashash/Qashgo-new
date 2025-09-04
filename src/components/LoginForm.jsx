
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: t('error'),
        description: t('allFieldsRequired'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is handled next
        throw fetchError;
      }
      
      if (!user || user.password !== formData.password) { // Password check (hash in real app)
        toast({
          title: t('error'),
          description: t('invalidEmailOrPassword'),
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      authLogin(user); 

      toast({
        title: t('loginSuccess'),
        description: t('welcomeUser', { username: user.name })
      });

      onLogin(user); 

    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: t('loginError'),
        description: error.message || t('errorOccurred'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pattern-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-effect border-white/10 card-hover">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl gradient-text">{t('login')}</CardTitle>
            <CardDescription>
              {t('loginToYourAccount')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailAddress')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('yourEmailPlaceholder')}
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('yourPasswordPlaceholder')}
                    className="bg-white/5 border-white/10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <Link to="/forgot-password">
                  <Button variant="link" className="p-0 h-auto text-sm text-primary">
                    {t('forgotPassword')}
                  </Button>
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                disabled={loading}
              >
                {loading ? t('loggingIn') : t('login')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('noAccountYet')}{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary"
                  onClick={onSwitchToRegister}
                >
                  {t('createAccount')}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;
