import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/finance";
import { Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface MonthlyReportProps {
  transactions: Transaction[];
}

export function MonthlyReport({ transactions }: MonthlyReportProps) {
  const monthlyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get last 6 months including current
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      months.push({
        key: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        name: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        date
      });
    }

    return months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === month.date.getMonth() &&
          transactionDate.getFullYear() === month.date.getFullYear()
        );
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = income - expenses;

      // Category breakdown
      const categoryBreakdown = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      const topCategory = Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)[0];

      return {
        ...month,
        income,
        expenses,
        balance,
        transactionCount: monthTransactions.length,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null
      };
    });
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-income";
    if (balance < 0) return "text-expense";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Relatório Mensal
        </CardTitle>
        <CardDescription>
          Visão detalhada dos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monthlyData.map((month, index) => (
            <div key={month.key} className={`p-4 border rounded-lg ${index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold capitalize">{month.name}</h3>
                  {index === 0 && (
                    <Badge variant="default">Mês Atual</Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {month.transactionCount} transações
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Receitas</span>
                  </div>
                  <div className="text-lg font-semibold text-income">
                    {formatCurrency(month.income)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingDown className="h-4 w-4" />
                    <span>Despesas</span>
                  </div>
                  <div className="text-lg font-semibold text-expense">
                    {formatCurrency(month.expenses)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Saldo</span>
                  </div>
                  <div className={`text-lg font-semibold ${getBalanceColor(month.balance)}`}>
                    {formatCurrency(month.balance)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Principal Gasto
                  </div>
                  {month.topCategory ? (
                    <div>
                      <div className="text-sm font-medium">{month.topCategory.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(month.topCategory.amount)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}