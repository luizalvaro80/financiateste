import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/types/finance";
import { GoalCard } from "./GoalCard";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GoalsManager() {
  const { 
    goals, 
    goalMovements,
    addGoal, 
    updateGoal, 
    deleteGoal, 
    addContributionToGoal,
    updateGoalContribution,
    loadGoalMovements,
    clearGoalMovements,
    calculateGoalProgress
  } = useSupabaseData();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'savings' | 'expense_limit'>('savings');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !targetAmount || !deadline) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(targetAmount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
      return;
    }

    addGoal({
      title,
      targetAmount: numericAmount,
      currentAmount: 0,
      deadline,
      category: category || 'Geral',
      type,
    });

    // Reset form
    setTitle("");
    setTargetAmount("");
    setDeadline("");
    setCategory("");
    setShowForm(false);

    toast({
      title: "Sucesso",
      description: "Meta adicionada com sucesso!",
    });
  };

  const getGoalsSummary = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => (g.currentAmount / g.targetAmount) >= 1).length;
    const overdueDgoals = goals.filter(g => {
      const today = new Date();
      const deadline = new Date(g.deadline);
      return deadline < today && (g.currentAmount / g.targetAmount) < 1;
    }).length;

    return { totalGoals, completedGoals, overdueDgoals };
  };

  const { totalGoals, completedGoals, overdueDgoals } = getGoalsSummary();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalGoals}</p>
                <p className="text-sm text-muted-foreground">Total de Metas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{completedGoals}</p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{overdueDgoals}</p>
                <p className="text-sm text-muted-foreground">Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Goals Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Metas Financeiras
              </CardTitle>
              <CardDescription>
                Gerencie suas metas financeiras com histórico de movimentações
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={calculateGoalProgress} variant="outline" size="sm">
                Atualizar Progresso
              </Button>
              <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalTitle">Título da Meta *</Label>
                  <Input
                    id="goalTitle"
                    placeholder="Ex: Viagem para Europa, Emergency Fund..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalType">Tipo *</Label>
                  <Select value={type} onValueChange={(value) => setType(value as any)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Meta de Economia</SelectItem>
                      <SelectItem value="expense_limit">Limite de Gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalAmount">
                    {type === 'savings' ? 'Valor Alvo (R$) *' : 'Limite Mensal (R$) *'}
                  </Label>
                  <Input
                    id="goalAmount"
                    type="text"
                    placeholder="0,00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalDeadline">Prazo *</Label>
                  <Input
                    id="goalDeadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="goalCategory">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.expense.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      <SelectItem value="Geral">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Adicionar Meta</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                movements={goalMovements.filter(m => m.goal_id === goal.id)}
                onUpdateGoal={updateGoal}
                onDeleteGoal={deleteGoal}
                onAddContribution={addContributionToGoal}
                onUpdateContribution={updateGoalContribution}
                onLoadMovements={loadGoalMovements}
                onClearHistory={clearGoalMovements}
              />
            ))}
          </div>

          {goals.length === 0 && !showForm && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma meta definida</p>
              <p className="text-sm">Comece definindo seus objetivos financeiros!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}