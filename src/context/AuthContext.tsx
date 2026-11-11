import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, saveSupabaseConfig, clearSupabaseConfig } from '../utils/supabase/client';

import { adminStore } from '../services/adminStore';
import { getPublicRedirectUrl } from '../utils/url';

export type UserRole = 'client' | 'driver' | 'admin' | null;

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isAdmin: boolean;
  profile: Record<string, any>;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: UserRole }>;
  adminSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    role: 'client' | 'driver',
    metadata: Record<string, any>
  ) => Promise<{ error: Error | null; user?: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
  updateSupabaseKeys: (url: string, anonKey: string) => void;
  removeSupabaseKeys: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState<boolean>(isSupabaseConfigured());

  const parseUserData = (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null);
      setIsAdmin(false);
      setProfile({});
      return;
    }
    const meta = currentUser.user_metadata || {};
    const detectedRole = (meta.role as UserRole) || (currentUser.email === 'info@gallant-corp.com' ? 'admin' : currentUser.email?.includes('driver') ? 'driver' : 'client');
    setRole(detectedRole);
    setIsAdmin(detectedRole === 'admin');
    setProfile(meta);
  };

  useEffect(() => {
    // Check if master admin session is active
    if (typeof window !== 'undefined' && localStorage.getItem('gallant_admin_active') === 'true') {
      const adminUser: any = {
        id: 'admin-master',
        email: 'info@gallant-corp.com',
        user_metadata: {
          role: 'admin',
          full_name: 'Master Dispatch Operations',
        },
      };
      setUser(adminUser);
      setRole('admin');
      setIsAdmin(true);
      setProfile(adminUser.user_metadata);
      setLoading(false);
      return;
    }

    const isConfig = isSupabaseConfigured();
    setConfigured(isConfig);

    if (!isConfig) {
      setLoading(false);
      return;
    }

    const client = getSupabase();

    // Check initial active session
    client.auth.getSession().then(({ data: { session: activeSession }, error }) => {
      if (!error && activeSession) {
        setSession(activeSession);
        setUser(activeSession.user);
        parseUserData(activeSession.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);
      parseUserData(currentUser);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const adminSignIn = async (email: string, password: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'info@gallant-corp.com' && password === 'Glh9811@#') {
      const adminUser: any = {
        id: 'admin-master',
        email: 'info@gallant-corp.com',
        user_metadata: {
          role: 'admin',
          full_name: 'Master Dispatch Operations',
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('gallant_admin_active', 'true');
      }
      setUser(adminUser);
      setRole('admin');
      setIsAdmin(true);
      setProfile(adminUser.user_metadata);
      return { error: null };
    }

    return {
      error: new Error('Invalid master administrative credentials. Access restricted to authorized personnel.'),
    };
  };

  const signIn = async (email: string, password: string) => {
    // If admin credentials are used on any sign in screen, route to admin
    if (email.toLowerCase().trim() === 'info@gallant-corp.com' && password === 'Glh9811@#') {
      return adminSignIn(email, password).then((res) => ({ ...res, role: 'admin' as UserRole }));
    }

    if (!isSupabaseConfigured()) {
      return {
        error: new Error(
          'Supabase credentials are not yet configured. Please enter your Supabase Project URL and Anon Key in the Configuration banner or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
        ),
      };
    }

    const client = getSupabase();
    let { data, error } = await client.auth.signInWithPassword({ email, password });

    // If Supabase returns 'Email not confirmed', auto-confirm via backend admin API and retry!
    if (error && error.message.toLowerCase().includes('email not confirmed')) {
      try {
        const confirmRes = await fetch('/api/auth/auto-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const confirmData = await confirmRes.json().catch(() => ({}));
        if (confirmData.success) {
          // Retry sign-in immediately with confirmed status
          const retry = await client.auth.signInWithPassword({ email, password });
          data = retry.data;
          error = retry.error;
        }
      } catch (autoErr) {
        console.warn('Auto-confirmation error:', autoErr);
      }
    }

    if (error) {
      return { error };
    }

    const detectedRole = (data.user?.user_metadata?.role as UserRole) || (email.includes('driver') ? 'driver' : 'client');
    setRole(detectedRole);
    return { error: null, role: detectedRole };
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'client' | 'driver',
    metadata: Record<string, any>
  ) => {
    if (!isSupabaseConfigured()) {
      return {
        error: new Error(
          'Supabase credentials are not yet configured. Please enter your Supabase Project URL and Anon Key in the Configuration banner or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
        ),
      };
    }

    const redirectTarget = role === 'driver' ? '/login/careers' : '/login/client';
    const redirectUrl = getPublicRedirectUrl(redirectTarget);

    const client = getSupabase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role,
          ...metadata,
          created_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      return { error };
    }

    // Automatically trigger administrative auto-confirmation in background
    try {
      fetch('/api/auth/auto-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
    } catch (e) {
      // background fire-and-forget
    }

    // Automatically sync new account to Master Admin store
    try {
      if (role === 'driver') {
        adminStore.addDriver({
          fullName: metadata.full_name || 'Driver Candidate',
          email,
          phone: metadata.phone || '',
          licenseClass: metadata.license_class || 'Class 1 / CDL-A',
          status: 'Pending Verification',
          licenceDoc: metadata.licence_doc,
          pictureDoc: metadata.picture_doc,
          residenceDoc: metadata.residence_doc,
          docsSubmittedAt: metadata.docs_submitted_at || new Date().toISOString(),
        });
      } else if (role === 'client') {
        adminStore.addShipper({
          companyName: metadata.company_name || 'Shipper Enterprise',
          contactName: metadata.full_name || metadata.company_name || 'Shipper Contact',
          email,
          phone: metadata.phone || '',
          status: 'Active',
        });
      }
    } catch (e) {
      console.warn('Could not auto-register to local admin store', e);
    }

    if (data.user) {
      parseUserData(data.user);
    }

    return { error: null, user: data.user };
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gallant_admin_active');
    }
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase();
        await client.auth.signOut();
      } catch (e) {
        // Ignore signout error if session was purely admin
      }
    }
    setUser(null);
    setSession(null);
    setRole(null);
    setIsAdmin(false);
    setProfile({});
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return {
        error: new Error('Supabase credentials are required to dispatch password reset emails.'),
      };
    }
    const client = getSupabase();
    const redirectUrl = getPublicRedirectUrl('/login/client');
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const resendConfirmationEmail = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase credentials are required.') };
    }
    const client = getSupabase();
    const redirectUrl = getPublicRedirectUrl('/login/client');
    const { error } = await client.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const updateSupabaseKeys = (url: string, anonKey: string) => {
    saveSupabaseConfig(url, anonKey);
    setConfigured(true);
    // Reload state with new client
    const client = getSupabase();
    client.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      parseUserData(activeSession?.user ?? null);
    });
  };

  const removeSupabaseKeys = () => {
    clearSupabaseConfig();
    setConfigured(false);
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile({});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAdmin,
        profile,
        loading,
        isConfigured: configured,
        signIn,
        adminSignIn,
        signUp,
        signOut,
        resetPassword,
        resendConfirmationEmail,
        updateSupabaseKeys,
        removeSupabaseKeys,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
