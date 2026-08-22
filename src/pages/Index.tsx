import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FinancialSummary } from "@/components/FinancialSummary";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { FinancialChart } from "@/components/FinancialChart";
import { EnhancedFinancialChart } from "@/components/EnhancedFinancialChart";
import { ReportFilters } from "@/components/ReportFilters";
import { AccountManager } from "@/components/AccountManager";
import { GoalsManager } from "@/components/GoalsManager";
import { MonthlyReport } from "@/components/MonthlyReport";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BillsManager } from "@/components/BillsManager";
import { SettingsManager } from "@/components/SettingsManager";
import { ClientManagement } from "@/components/ClientManagement";
import { AccessDenied } from "@/components/AccessDenied";
import { FinancialSummary as Summary, Transaction } from "@/types/finance";
import { useReportExport } from "@/hooks/useReportExport";
import { Calculator, TrendingUp, LogOut, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { SplashScreen } from "@/components/SplashScreen";
import { usePWAInstallTracking } from "@/hooks/usePWAInstallTracking";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { profile, isAdmin, loading: profileLoading, canAccess, getStatusMessage } = useUserProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showSplash, setShowSplash] = useState(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    return isStandalone;
  });

  // Track PWA installations
  usePWAInstallTracking();
  
  const {
    transactions,
    accounts,
    goals,
    bills,
    currentMonthBalance,
    loading: dataLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    addGoal,
    updateGoal,
    deleteGoal,
    addContributionToGoal,
    updateGoalContribution,
    calculateGoalProgress,
    addBill,
    updateBill,
    deleteBill,
    markBillAsPaid,
    sendWhatsAppReminder
  } = useSupabaseData();

  const { exportToPDF, printReport } = useReportExport();

  // Apply saved settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('financeapp-settings');
      if (saved) {
        const s = JSON.parse(saved);
        const hexToHsl = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h = 0, ss = 0, l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            ss = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return `${Math.round(h * 360)} ${Math.round(ss * 100)}% ${Math.round(l * 100)}%`;
        };
        const root = document.documentElement;
        if (s.primaryColor) root.style.setProperty('--primary', hexToHsl(s.primaryColor));
        if (s.backgroundColor) root.style.setProperty('--background', hexToHsl(s.backgroundColor));
        if (s.textColor) root.style.setProperty('--foreground', hexToHsl(s.textColor));
        if (s.cardColor) root.style.setProperty('--card', hexToHsl(s.cardColor));
      }
    } catch {}
  }, []);

  // Initialize filtered transactions
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  // Move useMemo hook before any conditional returns to follow Rules of Hooks
  const summary: Summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const openingBalance = currentMonthBalance?.opening_balance || 0;
    
    return {
      totalIncome,
      totalExpenses,
      balance: openingBalance + totalIncome - totalExpenses,
      transactionCount: transactions.length,
    };
  }, [transactions, currentMonthBalance]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || dataLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Check access - admins always pass
  if (!canAccess && profile) {
    return <AccessDenied status={profile.status} message={getStatusMessage() || ''} onSignOut={handleSignOut} />;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Futuristic Hero Section */}
      <div className="relative overflow-hidden bg-background border-b border-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(189_100%_50%_/_0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(189_100%_50%_/_0.1)_50%,transparent_75%)]" />
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 bg-card/50 backdrop-blur-md px-6 py-3 rounded-full border border-primary/30 shadow-glow">
              <Calculator className="h-8 w-8 text-primary animate-pulse" />
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  FinanceApp
                </h1>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="ml-4 border-white/20 text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                Controle total das suas finanças com tecnologia futurística
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-income/20 text-income px-4 py-2 rounded-full border border-income/30">
                <div className="w-2 h-2 bg-income rounded-full animate-pulse" />
                <span>Sistema Inteligente</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full border border-secondary/30">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span>Análise Avançada</span>
              </div>
              <div className="flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full border border-accent/30">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span>Mobile First</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Mobile Optimized */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-2 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`hidden md:grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-6'} h-auto p-1 bg-card/50 border border-primary/20`}>
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-sm py-3"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-sm py-3"
              >
                Transações
              </TabsTrigger>
              <TabsTrigger 
                value="accounts" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-sm py-3"
              >
                Contas
              </TabsTrigger>
              <TabsTrigger 
                value="goals" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-sm py-3"
              >
                Metas
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-sm py-3"
              >
                Relatórios
              </TabsTrigger>
              <TabsTrigger 
                value="bills" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-sm py-3"
              >
                Contas a Pagar
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-sm py-3"
                >
                  <Shield className="h-4 w-4 mr-1" /> Admin
                </TabsTrigger>
              )}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="dashboard" className="space-y-6 px-2">
                {/* Financial Summary */}
                <FinancialSummary summary={summary} />

                {/* Charts */}
                {transactions.length > 0 && (
                  <FinancialChart transactions={transactions} />
                )}

                {/* Quick Add Transaction */}
                <TransactionForm 
                  onAddTransaction={addTransaction} 
                  accounts={accounts.map(acc => ({ id: acc.id, name: acc.name }))}
                />
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6 px-2">
                {/* Add Transaction Form */}
                <TransactionForm 
                  onAddTransaction={addTransaction} 
                  accounts={accounts.map(acc => ({ id: acc.id, name: acc.name }))}
                />

                {/* Transaction List */}
            <TransactionList 
              transactions={transactions}
              accounts={accounts}
              onDeleteTransaction={deleteTransaction}
              onUpdateTransaction={updateTransaction}
            />
              </TabsContent>

              <TabsContent value="accounts" className="space-y-6 px-2">
                <AccountManager 
                  accounts={accounts}
                  onAddAccount={addAccount}
                  onUpdateAccount={updateAccount}
                  onDeleteAccount={deleteAccount}
                />
              </TabsContent>

              <TabsContent value="goals" className="space-y-6 px-2">
                <GoalsManager />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6 px-2">
                <div id="financial-report">
                  <ReportFilters 
                    transactions={transactions}
                    onFilterChange={setFilteredTransactions}
                    onExportPDF={() => exportToPDF(filteredTransactions)}
                    onPrint={printReport}
                  />
                  <div className="mt-6">
                    <MonthlyReport transactions={filteredTransactions} />
                  </div>
                  <div className="mt-6">
                    <EnhancedFinancialChart transactions={filteredTransactions} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bills" className="space-y-6 px-2">
          <BillsManager 
            bills={bills}
            onAddBill={addBill}
            onUpdateBill={updateBill}
            onDeleteBill={deleteBill}
            onMarkAsPaid={markBillAsPaid}
            onSendReminder={sendWhatsAppReminder}
          />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin" className="space-y-6 px-2">
                  <Tabs defaultValue="clients" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-card/50 border border-primary/20">
                      <TabsTrigger value="clients">Gestão de Clientes</TabsTrigger>
                      <TabsTrigger value="settings">Configurações</TabsTrigger>
                    </TabsList>
                    <TabsContent value="clients">
                      <ClientManagement />
                    </TabsContent>
                    <TabsContent value="settings">
                      <SettingsManager />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />

      {/* PWA Prompts */}
      <PWAInstallPrompt />
      <PWAUpdatePrompt />

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default Index;