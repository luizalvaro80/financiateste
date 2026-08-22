import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || (navigator as any).standalone === true;

  useEffect(() => {
    if (isStandalone || dismissed) return;

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowInstall(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS detection
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isSafari = /safari/.test(navigator.userAgent.toLowerCase()) && !/chrome/.test(navigator.userAgent.toLowerCase());
    if (isIOS && isSafari && !isStandalone) {
      setTimeout(() => setShowIOSPrompt(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone, dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowInstall(false);
    setShowIOSPrompt(false);
  };

  if (isStandalone || dismissed) return null;

  // iOS instruction
  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-card border border-primary/30 rounded-2xl p-4 shadow-lg animate-in slide-in-from-bottom-4">
        <button onClick={handleDismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <Share className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Instalar FinanceApp</p>
            <p className="text-xs text-muted-foreground mt-1">
              Toque em <strong>Compartilhar</strong> <Share className="inline h-3 w-3" /> e depois em <strong>"Adicionar à Tela de Início"</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Android install button
  if (showInstall) {
    return (
      <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            className="bg-primary text-primary-foreground shadow-lg rounded-full px-5 py-3 text-sm font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar App
          </Button>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground bg-card rounded-full p-2 border border-primary/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
