import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Users, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface InstallStats {
  total: number;
  android: number;
  ios: number;
  other: number;
  activeLastWeek: number;
}

export function PWAInstallStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<InstallStats>({ total: 0, android: 0, ios: 0, other: 0, activeLastWeek: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('pwa_installations' as any)
          .select('*')
          .eq('user_id', user.id);

        if (error || !data) return;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        setStats({
          total: data.length,
          android: data.filter((d: any) => d.platform === 'android').length,
          ios: data.filter((d: any) => d.platform === 'ios').length,
          other: data.filter((d: any) => !['android', 'ios'].includes(d.platform)).length,
          activeLastWeek: data.filter((d: any) => new Date(d.last_opened_at) >= oneWeekAgo).length,
        });
      } catch {}
    };

    fetchStats();
  }, [user]);

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5 text-primary" />
          Instalações do App
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-income/10 border border-income/20">
            <p className="text-2xl font-bold text-foreground">{stats.android}</p>
            <p className="text-xs text-muted-foreground">Android</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <p className="text-2xl font-bold text-foreground">{stats.ios}</p>
            <p className="text-xs text-muted-foreground">iOS</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
            <Activity className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold text-foreground">{stats.activeLastWeek}</p>
            <p className="text-xs text-muted-foreground">Ativos (7d)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
