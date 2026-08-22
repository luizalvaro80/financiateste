import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES, SUBCATEGORIES, PAYMENT_METHODS, Transaction } from "@/types/finance";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  accounts: Array<{ id: string; name: string; }>;
}

export function TransactionForm({ onAddTransaction, accounts }: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cash' | 'debit' | 'credit' | 'transfer' | 'other'>('pix');
  const [account, setAccount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [installments, setInstallments] = useState({ total: 1, current: 1 });
  const [isInstallment, setIsInstallment] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !category || !account) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
      return;
    }

    const transactionData: Omit<Transaction, 'id' | 'createdAt'> = {
      description,
      amount: numericAmount,
      type,
      category,
      subcategory: subcategory || undefined,
      date,
      paymentMethod,
      account,
      isRecurring,
      installments: isInstallment ? {
        current: installments.current,
        total: installments.total,
        originalAmount: numericAmount * installments.total
      } : undefined,
    };

    onAddTransaction(transactionData);

    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
    setSubcategory("");
    setAccount("");
    setIsRecurring(false);
    setIsInstallment(false);
    setInstallments({ total: 1, current: 1 });
    setDate(new Date().toISOString().split('T')[0]);

    toast({
      title: "Sucesso",
      description: "Transação adicionada com sucesso!",
    });
  };

  const availableSubcategories = category && SUBCATEGORIES[category as keyof typeof SUBCATEGORIES] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Transação
        </CardTitle>
        <CardDescription>
          Adicione uma nova receita ou despesa com detalhes completos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: Salário, Mercado, Conta de luz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <RadioGroup value={type} onValueChange={(value) => setType(value as 'income' | 'expense')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="text-income">Receita</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="text-expense">Despesa</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={(value) => {
                setCategory(value);
                setSubcategory("");
              }} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
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
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategoria</Label>
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma subcategoria" />
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
          </div>

          {/* Payment & Account */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
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

            <div className="space-y-2">
              <Label htmlFor="account">Conta *</Label>
              <Select value={account} onValueChange={setAccount} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
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
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(checked as boolean)} />
              <Label htmlFor="recurring">Transação recorrente</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="installment" checked={isInstallment} onCheckedChange={(checked) => setIsInstallment(checked as boolean)} />
              <Label htmlFor="installment">Parcelamento</Label>
            </div>

            {isInstallment && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="currentInstallment">Parcela Atual</Label>
                  <Input
                    id="currentInstallment"
                    type="number"
                    min="1"
                    value={installments.current}
                    onChange={(e) => setInstallments(prev => ({ ...prev, current: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalInstallments">Total de Parcelas</Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    min="1"
                    value={installments.total}
                    onChange={(e) => setInstallments(prev => ({ ...prev, total: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Transação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}