import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Transaction, Account, CATEGORIES, SUBCATEGORIES, PAYMENT_METHODS } from "@/types/finance";

interface TransactionEditFormProps {
  transaction: Transaction | null;
  accounts: Account[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTransaction: (id: string, transactionData: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function TransactionEditForm({ 
  transaction, 
  accounts, 
  open, 
  onOpenChange, 
  onUpdateTransaction 
}: TransactionEditFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('other');
  const [account, setAccount] = useState("");

  // Populate form with transaction data when dialog opens
  useEffect(() => {
    if (transaction && open) {
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setCategory(transaction.category);
      setSubcategory(transaction.subcategory || "");
      setDate(transaction.date);
      setPaymentMethod(transaction.paymentMethod);
      setAccount(transaction.account);
    }
  }, [transaction, open]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setType('expense');
    setCategory("");
    setSubcategory("");
    setDate("");
    setPaymentMethod('other');
    setAccount("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;
    
    // Validação
    if (!description.trim() || !amount || !category || !account) {
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    // Dados da transação
    const transactionData: Omit<Transaction, 'id' | 'createdAt'> = {
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
      subcategory: subcategory || undefined,
      date,
      paymentMethod,
      account,
      isRecurring: false
    };

    onUpdateTransaction(transaction.id, transactionData);
    resetForm();
    onOpenChange(false);
  };

  const availableSubcategories = SUBCATEGORIES[category as keyof typeof SUBCATEGORIES] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias na transação
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição da transação"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-amount">Valor</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label>Tipo</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'income' | 'expense')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="edit-income" />
                <Label htmlFor="edit-income">Receita</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="edit-expense" />
                <Label htmlFor="edit-expense">Despesa</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="edit-date">Data</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES[type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableSubcategories.length > 0 && (
            <div>
              <Label>Subcategoria</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a subcategoria (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((subcat) => (
                    <SelectItem key={subcat} value={subcat}>
                      {subcat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Método de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as Transaction['paymentMethod'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Conta</Label>
            <Select value={account} onValueChange={setAccount} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}