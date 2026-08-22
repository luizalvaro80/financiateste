import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, DollarSign, Bell, CheckCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Bill {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  due_date: string;
  is_paid: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

interface BillsManagerProps {
  bills: Bill[];
  onAddBill: (billData: { description: string; amount: number; dueDate: string; category: string }) => void;
  onUpdateBill: (id: string, billData: { description: string; amount: number; dueDate: string; category: string }) => void;
  onDeleteBill: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onSendReminder: (billId: string) => void;
}

export function BillsManager({ bills, onAddBill, onUpdateBill, onDeleteBill, onMarkAsPaid, onSendReminder }: BillsManagerProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    dueDate: "",
    category: "Contas"
  });

  const addBill = () => {
    if (!formData.description || !formData.amount || !formData.dueDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (editingBill) {
      onUpdateBill(editingBill.id, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        category: formData.category
      });
    } else {
      onAddBill({
        description: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        category: formData.category
      });
    }

    setFormData({ description: "", amount: "", dueDate: "", category: "Contas" });
    setShowForm(false);
    setEditingBill(null);
  };

  const markAsPaid = (id: string) => {
    onMarkAsPaid(id);
  };

  const editBill = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      description: bill.description,
      amount: bill.amount.toString(),
      dueDate: bill.due_date,
      category: bill.category
    });
    setShowForm(true);
  };

  const deleteBill = (id: string) => {
    onDeleteBill(id);
  };

  const sendReminder = (bill: Bill) => {
    onSendReminder(bill.id);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueBadgeVariant = (daysUntil: number, isPaid: boolean) => {
    if (isPaid) return "default";
    if (daysUntil < 0) return "destructive"; // Vencido - vermelho
    if (daysUntil === 0) return "destructive"; // Vence hoje - vermelho
    if (daysUntil <= 3) return "secondary"; // A vencer em poucos dias - amarelo
    if (daysUntil <= 7) return "outline"; // A vencer em uma semana - normal
    return "outline"; // A vencer - normal
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contas a Pagar</h2>
          <p className="text-muted-foreground">Gerencie suas contas e receba lembretes</p>
        </div>
        <Button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingBill(null);
              setFormData({ description: "", amount: "", dueDate: "", category: "Contas" });
            }
          }}
          className="shadow-glow"
        >
          {showForm ? "Cancelar" : "Nova Conta"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 shadow-glow">
          <CardHeader>
            <CardTitle>{editingBill ? "Editar Conta" : "Adicionar Nova Conta"}</CardTitle>
            <CardDescription>
              {editingBill ? "Altere os dados da conta" : "Cadastre uma nova conta a pagar e receba lembretes automáticos"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Ex: Conta de luz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({...prev, dueDate: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contas">Contas</SelectItem>
                    <SelectItem value="Moradia">Moradia</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Saúde">Saúde</SelectItem>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addBill} className="flex-1">
                {editingBill ? "Atualizar Conta" : "Adicionar Conta"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {bills.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma conta cadastrada ainda.
              </p>
            </CardContent>
          </Card>
        ) : (
          bills.map((bill) => {
            const daysUntil = getDaysUntilDue(bill.due_date);
            const badgeVariant = getDueBadgeVariant(daysUntil, bill.is_paid);
            
            return (
              <Card key={bill.id} className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{bill.description}</h3>
                        {bill.is_paid && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(bill.amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(bill.due_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <Badge variant="outline">{bill.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariant}>
                        {bill.is_paid 
                          ? "Paga" 
                          : daysUntil < 0 
                            ? "Vencido"
                            : daysUntil === 0
                              ? "Vence hoje"
                              : "A vencer"
                        }
                      </Badge>
                      {!bill.is_paid && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editBill(bill)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBill(bill.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendReminder(bill)}
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Lembrete
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => markAsPaid(bill.id)}
                          >
                            Marcar como Paga
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}