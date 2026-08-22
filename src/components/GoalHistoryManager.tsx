import { useState, useEffect } from "react";
import { GoalMovement } from "@/types/goalMovement";
import { Goal } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog-custom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Download, Trash2, TrendingUp, TrendingDown, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface GoalHistoryManagerProps {
  goal: Goal;
  movements: GoalMovement[];
  onClearHistory: (goalId: string) => void;
  onLoadMovements: (goalId: string) => void;
}

export function GoalHistoryManager({ 
  goal, 
  movements, 
  onClearHistory, 
  onLoadMovements 
}: GoalHistoryManagerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (showHistory && movements.length === 0) {
      onLoadMovements(goal.id);
    }
  }, [showHistory, goal.id, movements.length, onLoadMovements]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'edit':
        return <Edit className="h-4 w-4 text-blue-600" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'Contribuição';
      case 'withdrawal':
        return 'Retirada';
      case 'edit':
        return 'Edição';
      default:
        return type;
    }
  };

  const getMovementTypeVariant = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'default' as const;
      case 'withdrawal':
        return 'destructive' as const;
      case 'edit':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(18);
    pdf.text(`Histórico de Movimentações - ${goal.title}`, 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Meta: ${formatCurrency(goal.targetAmount)}`, 20, 35);
    pdf.text(`Saldo Atual: ${formatCurrency(goal.currentAmount)}`, 20, 45);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 55);
    
    // Table headers
    let y = 75;
    pdf.setFontSize(10);
    pdf.text('Data/Hora', 20, y);
    pdf.text('Tipo', 70, y);
    pdf.text('Valor', 110, y);
    pdf.text('Saldo Após', 150, y);
    
    // Table content
    movements.forEach((movement, index) => {
      y += 10;
      if (y > 270) { // New page
        pdf.addPage();
        y = 20;
      }
      
      pdf.text(formatDateTime(movement.created_at), 20, y);
      pdf.text(getMovementTypeLabel(movement.movement_type), 70, y);
      pdf.text(formatCurrency(movement.amount), 110, y);
      pdf.text(formatCurrency(movement.balance_after), 150, y);
      
      if (movement.description) {
        y += 6;
        pdf.setFontSize(8);
        pdf.text(`Desc: ${movement.description}`, 25, y);
        pdf.setFontSize(10);
      }
    });
    
    pdf.save(`historico-meta-${goal.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    
    toast({
      title: "Histórico exportado!",
      description: "O arquivo PDF foi baixado com sucesso.",
    });
  };

  const exportToCSV = () => {
    const headers = ['Data/Hora', 'Tipo', 'Valor', 'Saldo Após', 'Descrição'];
    const csvContent = [
      headers.join(','),
      ...movements.map(movement => [
        `"${formatDateTime(movement.created_at)}"`,
        `"${getMovementTypeLabel(movement.movement_type)}"`,
        movement.amount.toString().replace('.', ','),
        movement.balance_after.toString().replace('.', ','),
        `"${movement.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-meta-${goal.title.replace(/[^a-zA-Z0-9]/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Histórico exportado!",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  const handleClearHistory = () => {
    onClearHistory(goal.id);
    setShowClearDialog(false);
    toast({
      title: "Histórico limpo!",
      description: "Todas as movimentações foram removidas.",
    });
  };

  return (
    <>
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" title="Ver Histórico">
            <History className="h-3 w-3 mr-1" />
            Histórico
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Movimentações - {goal.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resumo da Meta</CardTitle>
                <CardDescription>
                  Meta: {formatCurrency(goal.targetAmount)} | 
                  Saldo Atual: {formatCurrency(goal.currentAmount)} | 
                  Total de Movimentações: {movements.length}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={exportToPDF}
                variant="outline"
                size="sm"
                disabled={movements.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button 
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                disabled={movements.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button 
                onClick={() => setShowClearDialog(true)}
                variant="outline"
                size="sm"
                disabled={movements.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Histórico
              </Button>
            </div>

            {/* Movements Table */}
            <div className="border rounded-lg max-h-96 overflow-auto">
              {movements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma movimentação encontrada.</p>
                  <p className="text-sm">As movimentações aparecerão aqui quando você fizer contribuições ou edições.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Saldo Após</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDateTime(movement.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMovementIcon(movement.movement_type)}
                              <Badge variant={getMovementTypeVariant(movement.movement_type)}>
                                {getMovementTypeLabel(movement.movement_type)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={
                              movement.movement_type === 'contribution' 
                                ? 'text-green-600' 
                                : movement.movement_type === 'withdrawal'
                                ? 'text-red-600'
                                : ''
                            }>
                              {movement.movement_type === 'contribution' ? '+' : 
                               movement.movement_type === 'withdrawal' ? '-' : ''}
                              {formatCurrency(Math.abs(movement.amount))}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(movement.balance_after)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {movement.description || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        title="Limpar Histórico"
        description={`Tem certeza que deseja limpar todo o histórico de movimentações da meta "${goal.title}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleClearHistory}
        confirmText="Sim, limpar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
}