import { useState } from "react";
import { Goal } from "@/types/finance";
import { GoalMovement } from "@/types/goalMovement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GoalHistoryManager } from "@/components/GoalHistoryManager";
import { Calendar, Target, TrendingUp, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoalCardProps {
  goal: Goal;
  movements: GoalMovement[];
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onAddContribution: (goalId: string, amount: number, description?: string) => void;
  onUpdateContribution?: (goalId: string, amount: number, description?: string) => void;
  onLoadMovements: (goalId: string) => void;
  onClearHistory: (goalId: string) => void;
}

export function GoalCard({ goal, movements, onUpdateGoal, onDeleteGoal, onAddContribution, onUpdateContribution, onLoadMovements, onClearHistory }: GoalCardProps) {
  const [showContribution, setShowContribution] = useState(false);
  const [showEditContribution, setShowEditContribution] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDescription, setContributionDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "text-green-600";
    if (progress >= 75) return "text-blue-600";
    if (progress >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const handleAddContribution = () => {
    const amount = parseFloat(contributionAmount.replace(',', '.'));
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
      return;
    }

    onAddContribution(goal.id, amount, contributionDescription || undefined);
    
    setContributionAmount("");
    setContributionDescription("");
    setShowContribution(false);
    
    toast({
      title: "Contribuição adicionada!",
      description: `${formatCurrency(amount)} adicionado à meta ${goal.title}`,
    });
  };

  const handleEditContribution = () => {
    const amount = parseFloat(editAmount.replace(',', '.'));
    
    if (isNaN(amount) || amount === 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido diferente de zero.",
        variant: "destructive",
      });
      return;
    }

    // Check if amount would make balance negative
    if (goal.currentAmount + amount < 0) {
      toast({
        title: "Erro",
        description: "O saldo da meta não pode ficar negativo.",
        variant: "destructive",
      });
      return;
    }

    if (onUpdateContribution) {
      onUpdateContribution(goal.id, amount, editDescription || undefined);
    }
    
    setEditAmount("");
    setEditDescription("");
    setShowEditContribution(false);
  };

  const getNewBalance = () => {
    const amount = parseFloat(editAmount.replace(',', '.'));
    if (isNaN(amount)) return goal.currentAmount;
    return goal.currentAmount + amount;
  };

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const daysLeft = getDaysLeft(goal.deadline);
  const isOverdue = daysLeft < 0;
  const isCompleted = progress >= 100;

  return (
    <div className="p-4 border rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Target className="h-4 w-4" />
            {goal.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Prazo: {formatDate(goal.deadline)}</span>
            {isOverdue ? (
              <Badge variant="destructive" className="ml-2">
                <AlertCircle className="h-3 w-3 mr-1" />
                Vencida
              </Badge>
            ) : daysLeft <= 30 ? (
              <Badge variant="secondary" className="ml-2">
                {daysLeft} dias restantes
              </Badge>
            ) : null}
            {isCompleted && (
              <Badge variant="default" className="ml-2 bg-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Concluída
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={goal.type === 'savings' ? 'default' : 'secondary'}>
            {goal.type === 'savings' ? 'Economia' : 'Limite de Gastos'}
          </Badge>
          
          <div className="flex gap-1">
            <Dialog open={showContribution} onOpenChange={setShowContribution}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" title="Adicionar Contribuição">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Contribuição</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Valor (R$)</label>
                    <Input
                      type="text"
                      placeholder="0,00"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição (opcional)</label>
                    <Input
                      placeholder="Ex: Contribuição mensal, Bônus..."
                      value={contributionDescription}
                      onChange={(e) => setContributionDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddContribution}>Adicionar</Button>
                    <Button variant="outline" onClick={() => setShowContribution(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {onUpdateContribution && (
              <Dialog open={showEditContribution} onOpenChange={setShowEditContribution}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" title="Editar Contribuição">
                    <Pencil className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Contribuição</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground">Saldo atual:</div>
                      <div className="font-medium">{formatCurrency(goal.currentAmount)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">
                        Valor (positivo para adicionar, negativo para retirar)
                      </label>
                      <Input
                        type="text"
                        placeholder="100,00 ou -50,00"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    </div>
                    
                    {editAmount && !isNaN(parseFloat(editAmount.replace(',', '.'))) && (
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm text-muted-foreground">Novo saldo:</div>
                        <div className={`font-medium ${getNewBalance() < 0 ? 'text-destructive' : ''}`}>
                          {formatCurrency(getNewBalance())}
                        </div>
                        {getNewBalance() < 0 && (
                          <div className="text-xs text-destructive mt-1">
                            ⚠️ Saldo não pode ser negativo
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium">Descrição (opcional)</label>
                      <Input
                        placeholder="Ex: Retirada para emergência, Ajuste..."
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleEditContribution}
                        disabled={getNewBalance() < 0}
                      >
                        Confirmar
                      </Button>
                      <Button variant="outline" onClick={() => setShowEditContribution(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <GoalHistoryManager
              goal={goal}
              movements={movements}
              onLoadMovements={onLoadMovements}
              onClearHistory={onClearHistory}
            />
            
            <Button variant="outline" size="sm" onClick={() => onDeleteGoal(goal.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progresso</span>
          <span className={getProgressColor(progress)}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <Progress 
          value={Math.min(progress, 100)} 
          className="h-3"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(goal.currentAmount)}</span>
          <span>{formatCurrency(goal.targetAmount)}</span>
        </div>
        
        {goal.type === 'expense_limit' && (
          <div className="text-xs text-center text-muted-foreground">
            {progress > 100 
              ? `Limite excedido em ${formatCurrency(goal.currentAmount - goal.targetAmount)}`
              : `Restante: ${formatCurrency(goal.targetAmount - goal.currentAmount)}`
            }
          </div>
        )}
      </div>

      {goal.category && (
        <div className="mt-3">
          <Badge variant="outline">{goal.category}</Badge>
        </div>
      )}
    </div>
  );
}