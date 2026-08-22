import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  // Load settings
  const settings = (() => {
    try {
      const saved = localStorage.getItem('financeapp-settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  })();

  const splashDuration = parseInt(localStorage.getItem('pwa-splash-duration') || '2000', 10);
  const systemName = settings.systemName || "FinanceApp";
  const logoUrl = settings.logoUrl || "";
  const bgColor = settings.primaryColor || "#0ea5e9";

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 500); // wait for fade-out
    }, splashDuration);
    return () => clearTimeout(timer);
  }, [splashDuration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-110"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <div className={`transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={systemName}
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover mb-6 shadow-2xl"
          />
        ) : (
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-2xl">
            <Calculator className="h-12 w-12 md:h-16 md:w-16 text-white" />
          </div>
        )}
      </div>

      <h1 className={`text-3xl md:text-4xl font-bold text-white mb-2 transition-all duration-700 delay-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        {systemName}
      </h1>

      <p className={`text-white/70 text-sm transition-all duration-700 delay-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        Carregando...
      </p>

      {/* Animated dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
