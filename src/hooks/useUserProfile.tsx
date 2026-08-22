import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp_number: string | null;
  status: string;
  approved: boolean;
  subscription_due_date: string | null;
  last_payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData as UserProfile);

          // Check inadimplência automática
          if (profileData.status === 'ATIVO' && profileData.subscription_due_date) {
            const dueDate = new Date(profileData.subscription_due_date);
            if (dueDate < new Date()) {
              await supabase
                .from('user_profiles')
                .update({ status: 'INADIMPLENTE' })
                .eq('user_id', user.id);
              setProfile(prev => prev ? { ...prev, status: 'INADIMPLENTE' } : null);
            }
          }
        }

        // Check admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!roleData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const canAccess = profile?.status === 'ATIVO' || isAdmin;

  const getStatusMessage = () => {
    if (!profile) return null;
    switch (profile.status) {
      case 'PENDENTE':
        return 'Seu cadastro está aguardando aprovação pelo administrador.';
      case 'BLOQUEADO':
        return 'Usuário bloqueado. Entre em contato com o administrador.';
      case 'INADIMPLENTE':
        return 'Pagamento em atraso. Regularize sua situação para continuar usando o sistema.';
      default:
        return null;
    }
  };

  return { profile, isAdmin, loading, canAccess, getStatusMessage };
}
