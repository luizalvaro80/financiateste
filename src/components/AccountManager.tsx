import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Account } from "@/types/finance";
import { Plus, CreditCard, Wallet, Building, TrendingUp, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccountManagerProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount: (id: string, updates: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
}

export function AccountManager({ accounts, onAddAccount, onUpdateAccount, onDeleteAccount }: AccountManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<'checking' | 'savings' | 'credit' | 'investment'>('checking');
  const [balance, setBalance] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  
  // Estados para edição
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<'checking' | 'savings' | 'credit' | 'investment'>('checking');
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !balance) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const numericBalance = parseFloat(balance.replace(',', '.'));
    const numericCreditLimit = type === 'credit' ? parseFloat(creditLimit.replace(',', '.')) : undefined;

    onAddAccount({
      name,
      type,
      balance: numericBalance,
      creditLimit: numericCreditLimit,
    });

    // Reset form
    setName("");
    setBalance("");
    setCreditLimit("");
    setShowForm(false);

    toast({
      title: "Sucesso",
      description: "Conta adicionada com sucesso!",
    });
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="h-4 w-4" />;
      case 'savings': return <Building className="h-4 w-4" />;
      case 'credit': return <CreditCard className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'credit': return 'Cartão de Crédito';
      case 'investment': return 'Investimento';
      default: return type;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDeleteAccount = (accountId: string, accountName: string) => {
    onDeleteAccount(accountId);
    toast({
      title: "Conta excluída",
      description: `A conta "${accountName}" foi excluída com sucesso.`,
    });
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setEditName(account.name);
    setEditType(account.type);
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editName || !editingAccount) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome da conta.",
        variant: "destructive",
      });
      return;
    }

    onUpdateAccount(editingAccount.id, {
      name: editName,
      type: editType,
    });

    setEditingAccount(null);
    setEditName("");
    setEditType('checking');

    toast({
      title: "Sucesso",
      description: "Conta atualizada com sucesso!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Contas e Cartões
            </CardTitle>
            <CardDescription>
              Gerencie suas contas bancárias e cartões de crédito
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Nome da Conta *</Label>
                <Input
                  id="accountName"
                  placeholder="Ex: Banco do Brasil, Nubank..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo *</Label>
                <Select value={type} onValueChange={(value) => setType(value as any)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountBalance">
                  {type === 'credit' ? 'Fatura Atual (R$)' : 'Saldo Atual (R$)'} *
                </Label>
                <Input
                  id="accountBalance"
                  type="text"
                  placeholder="0,00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  required
                />
              </div>

              {type === 'credit' && (
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Limite (R$)</Label>
                  <Input
                    id="creditLimit"
                    type="text"
                    placeholder="0,00"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit">Adicionar Conta</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div key={account.id} className="p-4 border rounded-lg bg-card/50 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getAccountIcon(account.type)}
                  <span className="font-medium">{account.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getAccountTypeLabel(account.type)}
                  </Badge>
                  <Dialog open={editingAccount?.id === account.id} onOpenChange={(open) => !open && setEditingAccount(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Conta</DialogTitle>
                        <DialogDescription>
                          Altere o nome e tipo da conta.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateAccount} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="editAccountName">Nome da Conta</Label>
                          <Input
                            id="editAccountName"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editAccountType">Tipo</Label>
                          <Select value={editType} onValueChange={(value) => setEditType(value as any)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checking">Conta Corrente</SelectItem>
                              <SelectItem value="savings">Poupança</SelectItem>
                              <SelectItem value="credit">Cartão de Crédito</SelectItem>
                              <SelectItem value="investment">Investimento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
                            Salvar
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir conta</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a conta "{account.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteAccount(account.id, account.name)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {account.type === 'credit' ? 'Fatura:' : 'Saldo:'}
                </div>
                <div className={`text-lg font-bold ${
                  account.type === 'credit' 
                    ? account.balance > 0 ? 'text-expense' : 'text-muted-foreground'
                    : account.balance >= 0 ? 'text-income' : 'text-expense'
                }`}>
                  {formatCurrency(account.balance)}
                </div>
                
                {account.creditLimit && account.type === 'credit' && (
                  <div className="text-xs text-muted-foreground">
                    Limite: {formatCurrency(account.creditLimit)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {accounts.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma conta cadastrada. Adicione sua primeira conta!
          </div>
        )}
      </CardContent>
    </Card>
  );
}