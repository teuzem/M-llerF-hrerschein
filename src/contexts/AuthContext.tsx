import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/supabase'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export type { Profile }

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<{ requiresMFA: boolean; factorId?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
  deleteAccount: () => Promise<void>
  enrollTOTP: () => Promise<{ qrCode: string; secret: string; factorId: string } | null>
  verifyTOTP: (factorId: string, code: string) => Promise<boolean>
  unenrollTOTP: (factorId: string) => Promise<boolean>
  challengeTOTP: (factorId: string, code: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [presenceChannel, setPresenceChannel] = useState<RealtimeChannel | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        if (error.code !== 'PGRST116') console.error('Error fetching profile:', error)
        return
      }
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setTimeout(async () => { await fetchProfile(session.user.id) }, 0)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && !presenceChannel) {
      const channel = supabase.channel('online-users', { config: { presence: { key: user.id } } });
      channel
        .on('presence', { event: 'sync' }, () => {})
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date().toISOString() });
        });
      setPresenceChannel(channel);
      const interval = setInterval(async () => {
        if (document.visibilityState === 'visible') {
          await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
        }
      }, 20000);
      return () => { if (presenceChannel) supabase.removeChannel(presenceChannel); clearInterval(interval); };
    } else if (!user && presenceChannel) {
      supabase.removeChannel(presenceChannel);
      setPresenceChannel(null);
    }
  }, [user, presenceChannel]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, phone } }
      })
      if (error) throw error
      toast.success(t('auth.messages.signup_success'))
    } catch (error: any) {
      toast.error(error.message || t('auth.messages.signup_error'))
      throw error
    }
  }

  const signIn = async (email: string, password: string): Promise<{ requiresMFA: boolean; factorId?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const totpFactor = data.user?.factors?.find(f => f.factor_type === 'totp' && f.status === 'verified');
      if (totpFactor) return { requiresMFA: true, factorId: totpFactor.id };
      toast.success(t('auth.messages.signin_success'))
      return { requiresMFA: false };
    } catch (error: any) {
      toast.error(error.message || t('auth.messages.signin_error'))
      throw error
    }
  }

  const signOut = async () => {
    try {
      if (presenceChannel) await presenceChannel.untrack();
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success(t('auth.messages.signout_success'))
    } catch (error: any) {
      toast.error(error.message || t('auth.messages.signout_error'))
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error(t('auth.messages.no_user_logged_in'))
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) throw error
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success(t('auth.messages.profile_update_success'))
    } catch (error: any) {
      toast.error(error.message || t('auth.messages.profile_update_error'))
      throw error
    }
  }

  const refreshProfile = async () => { if (user) await fetchProfile(user.id); };

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in');
    try {
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
      if (profileError) throw profileError;
      await supabase.auth.signOut();
      setProfile(null); setUser(null); setSession(null);
      toast.success('Konto erfolgreich gelöscht');
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Löschen des Kontos');
      throw error;
    }
  };

  const enrollTOTP = async (): Promise<{ qrCode: string; secret: string; factorId: string } | null> => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'MüllerFührerschein Auth' });
      if (error) throw error;
      return { qrCode: data.totp.qr_code, secret: data.totp.secret, factorId: data.id };
    } catch (error: any) {
      toast.error(error.message || '2FA-Registrierung fehlgeschlagen');
      return null;
    }
  };

  const verifyTOTP = async (factorId: string, code: string): Promise<boolean> => {
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challengeData.id, code });
      if (verifyError) throw verifyError;
      toast.success('2FA erfolgreich aktiviert!');
      return true;
    } catch (error: any) {
      toast.error(error.message || '2FA-Verifizierung fehlgeschlagen');
      return false;
    }
  };

  const unenrollTOTP = async (factorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success('2FA deaktiviert');
      return true;
    } catch (error: any) {
      toast.error(error.message || '2FA-Deaktivierung fehlgeschlagen');
      return false;
    }
  };

  const challengeTOTP = async (factorId: string, code: string): Promise<boolean> => {
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challengeData.id, code });
      if (verifyError) throw verifyError;
      toast.success(t('auth.messages.signin_success'));
      return true;
    } catch (error: any) {
      toast.error(error.message || '2FA-Code ungültig');
      return false;
    }
  };

  const value: AuthContextType = {
    user, profile, session, loading,
    signUp, signIn, signOut, updateProfile, refreshProfile,
    deleteAccount, enrollTOTP, verifyTOTP, unenrollTOTP, challengeTOTP,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
