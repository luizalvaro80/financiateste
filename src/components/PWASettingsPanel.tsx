import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Bell, Palette, Save } from "lucide-react";
import { PWAInstallStats } from "./PWAInstallStats";

export function PWASettingsPanel() {
  const { toast } = useToast();

  const [splashDuration, setSplashDuration] = useState(() => {
    return parseInt(localStorage.getItem('pwa-splash-duration') || '2000', 10);
  });

  const [orientation, setOrientation] = useState(() => {
    return localStorage.getItem('pwa-orientation') || 'portrait';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('pwa-notifications') === 'true';
  });

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Não suportado",
        description: "Notificações não são suportadas neste navegador.",
        variant: "destructive",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('pwa-notifications', 'true');
      toast({
        title: "Notificações ativadas",
        description: "Você receberá notificações do app.",
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Ative as notificações nas configurações do navegador.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    localStorage.setItem('pwa-splash-duration', splashDuration.toString());
    localStorage.setItem('pwa-orientation', orientation);

    toast({
      title: "Configurações PWA salvas",
      description: "As alterações serão aplicadas na próxima abertura do app.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Install Stats */}
      <PWAInstallStats />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Splash Screen Settings */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Splash Screen
            </CardTitle>
            <CardDescription>
              Configure a tela de abertura do app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Duração da Splash ({(splashDuration / 1000).toFixed(1)}s)</Label>
              <Slider
                value={[splashDuration]}
                onValueChange={(v) => setSplashDuration(v[0])}
                min={1000}
                max={4000}
                step={250}
              />
              <p className="text-xs text-muted-foreground">
                A splash usa automaticamente a logo e cor primária definidas nas Configurações do Sistema.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PWA Behavior */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Comportamento do App
            </CardTitle>
            <CardDescription>
              Ajuste como o app se comporta quando instalado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Orientação</Label>
              <Select value={orientation} onValueChange={setOrientation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Retrato (vertical)</SelectItem>
                  <SelectItem value="landscape">Paisagem (horizontal)</SelectItem>
                  <SelectItem value="any">Qualquer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              ⚠️ Funcionalidades PWA (instalação, offline, splash) funcionam apenas na versão publicada.
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card/50 border-primary/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações Push
            </CardTitle>
            <CardDescription>
              Receba alertas sobre contas a pagar e metas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Status: {notificationsEnabled ? '✅ Ativadas' : '❌ Desativadas'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notificationsEnabled 
                    ? 'Você receberá notificações de lembretes e alertas.'
                    : 'Ative para receber lembretes de contas e alertas de metas.'
                  }
                </p>
              </div>
              <Button
                onClick={handleRequestNotificationPermission}
                variant={notificationsEnabled ? "outline" : "default"}
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                {notificationsEnabled ? 'Reconfigurar' : 'Ativar Notificações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSave} className="shadow-glow" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações PWA
        </Button>
      </div>
    </div>
  );
}
