import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, DollarSign, AlertCircle } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { ConfirmDialog } from '@/components/ui/dialog-custom';

export function MonthlyClosingManager() {
  const { currentMonthBalance, performMonthlyClosing } = useSupabaseData();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [targetMonth, setTargetMonth] = useState({ month: 0, year: 0 });

  const handlePerformClosing = (month: number, year: number) => {
    setTargetMonth({ month, year });
    setShowConfirmDialog(true);
  };

  const confirmClosing = async () => {
    await performMonthlyClosing(targetMonth.month, targetMonth.year);
  };

  const getCurrentMonth = () => {
    const date = new Date();
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      name: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    };
  };

  const getPreviousMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      name: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    };
  };

  const currentMonth = getCurrentMonth();
  const previousMonth = getPreviousMonth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Fechamento Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Month Status */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Mês Atual: {currentMonth.name}</h3>
            {currentMonthBalance ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/20 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Saldo Inicial</p>
                  <p className="font-semibold">{formatCurrency(currentMonthBalance.opening_balance)}</p>
                </div>
                <div className="bg-muted/20 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold text-primary">Em Andamento</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Sistema de fechamento mensal não inicializado.
                  <br />
                  Execute o SQL de criação da tabela monthly_balances primeiro.
                </span>
              </div>
            )}
          </div>

          {/* Manual Closing Actions */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-3">Ações de Fechamento</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePerformClosing(previousMonth.month, previousMonth.year)}
                className="w-full justify-start gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Fechar Mês Anterior ({previousMonth.name})
              </Button>
            </div>
          </div>

          {/* Information */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Automático:</strong> O fechamento acontece automaticamente quando você acessa o sistema em um novo mês.
              <br />
              <strong>Manual:</strong> Use os botões acima para forçar o fechamento de um mês específico.
            </p>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirmar Fechamento Mensal"
        description={`Deseja fechar o mês ${targetMonth.month}/${targetMonth.year}? Esta ação calculará o saldo final e não poderá ser desfeita.`}
        onConfirm={confirmClosing}
        confirmText="Fechar Mês"
        cancelText="Cancelar"
        variant="default"
      />
    </div>
  );
}