import { Home, PlusCircle, BarChart3, Target, CreditCard, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

export function MobileBottomNav({ activeTab, onTabChange, isAdmin }: MobileBottomNavProps) {
  const navItems = [
    { id: "dashboard", icon: Home, label: "Home" },
    { id: "transactions", icon: PlusCircle, label: "Lançar" },
    { id: "accounts", icon: CreditCard, label: "Contas" },
    { id: "goals", icon: Target, label: "Metas" },
    ...(isAdmin ? [{ id: "admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-primary/20 md:hidden">
      <div className={`grid ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} h-16`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200",
                isActive 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
