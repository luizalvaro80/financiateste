export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  date: string;
  createdAt: string;
  paymentMethod: 'pix' | 'cash' | 'debit' | 'credit' | 'transfer' | 'other';
  account: string;
  isRecurring: boolean;
  installments?: {
    current: number;
    total: number;
    originalAmount: number;
  };
  tags?: string[];
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  type: 'savings' | 'expense_limit';
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  creditLimit?: number;
}

export const CATEGORIES = {
  income: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Vendas',
    'Prêmios',
    'Outros'
  ],
  expense: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Contas',
    'Outros'
  ]
} as const;

export const SUBCATEGORIES = {
  'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Lanche'],
  'Transporte': ['Combustível', 'Uber/Taxi', 'Transporte Público', 'Manutenção'],
  'Moradia': ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet'],
  'Saúde': ['Médico', 'Medicamentos', 'Plano de Saúde', 'Academia'],
  'Educação': ['Curso', 'Livros', 'Material Escolar'],
  'Lazer': ['Cinema', 'Viagem', 'Streaming', 'Hobbies'],
  'Compras': ['Roupas', 'Eletrônicos', 'Casa', 'Presentes'],
  'Contas': ['Cartão', 'Financiamento', 'Impostos', 'Seguros']
} as const;

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'debit', label: 'Cartão Débito' },
  { value: 'credit', label: 'Cartão Crédito' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'other', label: 'Outros' }
] as const;