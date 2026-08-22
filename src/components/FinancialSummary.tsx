import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Receipt, Calendar } from "lucide-react";
import { FinancialSummary as Summary } from "@/types/finance";

interface FinancialSummaryProps {
  summary: Summary;
}

export function FinancialSummary({ summary }: FinancialSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCurrentMonthName = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Dados de {getCurrentMonthName()}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-income/10 to-income/5 border-income/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-income">
            Receitas (Mês Atual)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-income" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-income">
            {formatCurrency(summary.totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-expense">
            Despesas (Mês Atual)
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-expense" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-expense">
            {formatCurrency(summary.totalExpenses)}
          </div>
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-br ${summary.balance >= 0 ? 'from-profit/10 to-profit/5 border-profit/20' : 'from-loss/10 to-loss/5 border-loss/20'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-medium ${summary.balance >= 0 ? 'text-profit' : 'text-loss'}`}>
            Saldo (Inicial + Mês)
          </CardTitle>
          <DollarSign className={`h-4 w-4 ${summary.balance >= 0 ? 'text-profit' : 'text-loss'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatCurrency(summary.balance)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Transações (Mês Atual)
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.transactionCount}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}