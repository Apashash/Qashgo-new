
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const sessionUser = localStorage.getItem('superear_user');
      if (sessionUser) {
        const parsedUser = JSON.parse(sessionUser);
        
        const { data: supabaseUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', parsedUser.id)
          .single();

        if (supabaseUser && !error) {
          setUser(supabaseUser);
        } else {
          localStorage.removeItem('superear_user');
        }
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id) 
            .single();
          if (profile && !error) {
            setUser(profile);
            localStorage.setItem('superear_user', JSON.stringify(profile));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('superear_user');
        }
      }
    );

    return () => {
      
      if (authListener && authListener.subscription && typeof authListener.subscription.unsubscribe === 'function') {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (userData) => {
    setUser(userData);
    localStorage.setItem('superear_user', JSON.stringify(userData));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('superear_user');
  };

  const updateUser = async (updates) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (data && !error) {
      setUser(data);
      localStorage.setItem('superear_user', JSON.stringify(data));
    }
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
};
