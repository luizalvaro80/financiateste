import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Transaction } from "@/types/finance";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface FinancialChartProps {
  transactions: Transaction[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const categoryColor = payload[0].color || payload[0].payload.fill;
    
    return (
      <div 
        className="p-3 rounded-lg shadow-lg border text-white font-medium"
        style={{ 
          backgroundColor: categoryColor,
          borderColor: categoryColor 
        }}
      >
        <p className="text-white font-semibold">{data.name || label}</p>
        <p className="text-white">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value)}
        </p>
      </div>
    );
  }
  return null;
};

export function FinancialChart({ transactions }: FinancialChartProps) {
  // Dados para gráfico de barras (receitas vs despesas por mês)
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].expense += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  const barData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => ({
      ...item,
      monthName: new Date(item.month + '-01').toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: '2-digit' 
      })
    }));

  // Dados para gráfico de pizza (despesas por categoria)
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  const getCategoryColor = (category: string) => {
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
    const categoryMap: Record<string, string> = {
      'alimentação': 'hsl(var(--category-alimentacao))',
      'transporte': 'hsl(var(--category-transporte))',
      'moradia': 'hsl(var(--category-moradia))',
      'saúde': 'hsl(var(--category-saude))',
      'educação': 'hsl(var(--category-educacao))',
      'lazer': 'hsl(var(--category-lazer))',
      'compras': 'hsl(var(--category-compras))',
      'contas': 'hsl(var(--category-contas))',
      'outros': 'hsl(var(--category-outros))',
    };
    
    return categoryMap[normalizedCategory] || 'hsl(var(--chart-1))';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Gráfico de Barras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Receitas vs Despesas
          </CardTitle>
          <CardDescription>
            Comparação mensal entre receitas e despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="monthName" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'income' ? 'Receitas' : 'Despesas'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="income" 
                  fill="hsl(var(--income))" 
                  name="income"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expense" 
                  fill="hsl(var(--expense))" 
                  name="expense"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível para exibição
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Pizza */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Despesas por Categoria
          </CardTitle>
          <CardDescription>
            Distribuição das suas despesas por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  className="text-sm"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhuma despesa registrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}