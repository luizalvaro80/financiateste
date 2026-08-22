import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Palette, Type, Image, Save, RotateCcw, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PWASettingsPanel } from "./PWASettingsPanel";

interface SystemSettings {
  systemName: string;
  systemDescription: string;
  logoUrl: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardColor: string;
}

const defaultSettings: SystemSettings = {
  systemName: "FinanceApp",
  systemDescription: "Controle total das suas finanças com tecnologia futurística",
  logoUrl: "",
  primaryColor: "#0ea5e9", // sky-500
  backgroundColor: "#0f172a", // slate-900
  textColor: "#f8fafc", // slate-50
  cardColor: "#1e293b", // slate-800
};

const loadSavedSettings = (): SystemSettings => {
  try {
    const saved = localStorage.getItem('financeapp-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch {}
  return defaultSettings;
};

export function SettingsManager() {
  const [settings, setSettings] = useState<SystemSettings>(loadSavedSettings);
  const [previewImage, setPreviewImage] = useState<string>(() => loadSavedSettings().logoUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Apply saved theme on mount
  useEffect(() => {
    if (localStorage.getItem('financeapp-settings')) {
      applyTheme(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Máximo 2MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
        setSettings(prev => ({ ...prev, logoUrl: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTheme = (themeSettings: SystemSettings) => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS custom properties
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply theme colors
    root.style.setProperty('--primary', hexToHsl(themeSettings.primaryColor));
    root.style.setProperty('--background', hexToHsl(themeSettings.backgroundColor));
    root.style.setProperty('--foreground', hexToHsl(themeSettings.textColor));
    root.style.setProperty('--card', hexToHsl(themeSettings.cardColor));

    // Update system name and description
    const titleElement = document.querySelector('h1');
    const descriptionElement = titleElement?.parentElement?.querySelector('p');
    
    if (titleElement) {
      titleElement.textContent = themeSettings.systemName;
    }
    
    if (descriptionElement) {
      descriptionElement.textContent = themeSettings.systemDescription;
    }

    // Update logo if available
    if (themeSettings.logoUrl) {
      const logoElements = document.querySelectorAll('[data-logo]');
      logoElements.forEach(element => {
        if (element instanceof HTMLImageElement) {
          element.src = themeSettings.logoUrl;
        }
      });
    }
  };

  const handleSave = () => {
    try {
      // Save to localStorage
      localStorage.setItem('financeapp-settings', JSON.stringify(settings));
      
      // Apply changes immediately
      applyTheme(settings);
      
      toast({
        title: "Configurações salvas",
        description: "As alterações foram aplicadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = () => {
    setSettings(defaultSettings);
    setPreviewImage("");
    applyTheme(defaultSettings);
    
    // Clear localStorage
    localStorage.removeItem('financeapp-settings');
    
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações foram restauradas para o padrão.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Configurações do Sistema</h2>
        <p className="text-muted-foreground">Personalize a aparência e identidade do seu sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Customization */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Personalização de Tema
            </CardTitle>
            <CardDescription>Altere as cores principais do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Primária</Label>
              <Input
                id="primary-color"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="h-12 w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="background-color">Cor de Fundo</Label>
              <Input
                id="background-color"
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="h-12 w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text-color">Cor do Texto</Label>
              <Input
                id="text-color"
                type="color"
                value={settings.textColor}
                onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                className="h-12 w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-color">Cor dos Cards</Label>
              <Input
                id="card-color"
                type="color"
                value={settings.cardColor}
                onChange={(e) => setSettings(prev => ({ ...prev, cardColor: e.target.value }))}
                className="h-12 w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Identity */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Identidade do Sistema
            </CardTitle>
            <CardDescription>Personalize o nome e descrição do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system-name">Nome do Sistema</Label>
              <Input
                id="system-name"
                value={settings.systemName}
                onChange={(e) => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
                placeholder="Ex: FinanceApp"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="system-description">Descrição</Label>
              <Textarea
                id="system-description"
                value={settings.systemDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, systemDescription: e.target.value }))}
                placeholder="Descrição que aparece no sistema"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Logo do Sistema
            </CardTitle>
            <CardDescription>Faça upload da logo ou ícone principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Image className="h-4 w-4 mr-2" />
                Selecionar Imagem
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle>Preview das Alterações</CardTitle>
            <CardDescription>Veja como ficará o sistema com as novas configurações</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 text-center space-y-2"
              style={{
                backgroundColor: settings.cardColor,
                color: settings.textColor,
                borderColor: settings.primaryColor + '40'
              }}
            >
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Logo Preview"
                  className="w-8 h-8 mx-auto rounded"
                />
              )}
              <h3 
                className="font-bold text-lg"
                style={{ color: settings.primaryColor }}
              >
                {settings.systemName}
              </h3>
              <p className="text-sm opacity-90">{settings.systemDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* PWA Settings - Full Panel */}
        <div className="md:col-span-2">
          <PWASettingsPanel />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
        
        <Button
          onClick={handleRestore}
          variant="outline"
          size="lg"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar Padrão
        </Button>
      </div>
    </div>
  );
}