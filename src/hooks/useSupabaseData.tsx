import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Account, Goal } from '@/types/finance';
import { MonthlyBalance } from '@/types/monthlyBalance';
import { GoalMovement, GoalMovementData } from '@/types/goalMovement';
import { useToast } from '@/hooks/use-toast';

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

// Database row types
interface DbTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  subcategory: string | null;
  date: string;
  account: string;
  payment_method: string;
  is_recurring: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface DbAccount {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  credit_limit: number | null;
  created_at: string;
  updated_at: string;
}

interface DbGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface DbMonthlyBalance {
  id: string;
  user_id: string;
  month: number;
  year: number;
  opening_balance: number;
  total_income: number;
  total_expenses: number;
  closing_balance: number;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

interface DbGoalMovement {
  id: string;
  goal_id: string;
  user_id: string;
  movement_type: string;
  amount: number;
  description: string | null;
  balance_after: number;
  created_at: string;
  updated_at: string;
}

export function useSupabaseData() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [goalMovements, setGoalMovements] = useState<GoalMovement[]>([]);
  const [currentMonthBalance, setCurrentMonthBalance] = useState<MonthlyBalance | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCurrentMonthBalance(),
        loadTransactions(),
        loadAccounts(),
        loadGoals(),
        loadBills()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const dbData = data as unknown as DbTransaction[];
      const transformedData = (dbData || []).map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        category: item.category,
        type: item.type as 'income' | 'expense',
        account: item.account,
        date: item.date,
        createdAt: item.created_at,
        paymentMethod: (item.payment_method || 'other') as 'pix' | 'cash' | 'debit' | 'credit' | 'transfer' | 'other',
        isRecurring: item.is_recurring || false
      }));
      
      setTransactions(transformedData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadAccounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const dbData = data as unknown as DbAccount[];
      
      if (!dbData || dbData.length === 0) {
        await addAccount({ name: 'Conta Principal', type: 'checking', balance: 0 });
        return;
      }
      
      const transformedData = dbData.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as 'checking' | 'savings' | 'credit' | 'investment',
        balance: item.balance
      }));
      
      setAccounts(transformedData);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const dbData = data as unknown as DbGoal[];
      const transformedData = (dbData || []).map(item => ({
        id: item.id,
        title: item.name,
        targetAmount: item.target_amount,
        currentAmount: item.current_amount,
        deadline: item.target_date,
        category: item.category || 'general',
        type: (item.type || 'savings') as 'savings' | 'expense_limit'
      }));
      
      setGoals(transformedData);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadBills = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      setBills((data as unknown as Bill[]) || []);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const loadCurrentMonthBalance = async () => {
    if (!user) return;
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const { data, error } = await supabase
        .from('monthly_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        await getOrCreateCurrentMonthBalance();
      } else {
        const dbData = data as unknown as DbMonthlyBalance;
        setCurrentMonthBalance({
          id: dbData.id,
          user_id: dbData.user_id,
          month: dbData.month,
          year: dbData.year,
          opening_balance: dbData.opening_balance,
          total_income: dbData.total_income,
          total_expenses: dbData.total_expenses,
          closing_balance: dbData.closing_balance,
          is_closed: dbData.is_closed,
          created_at: dbData.created_at,
          updated_at: dbData.updated_at
        });
      }
    } catch (error) {
      console.error('Error loading current month balance:', error);
      const emptyBalance: MonthlyBalance = {
        id: '',
        user_id: user.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        opening_balance: 0,
        total_income: 0,
        total_expenses: 0,
        closing_balance: 0,
        is_closed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCurrentMonthBalance(emptyBalance);
    }
  };

  const getOrCreateCurrentMonthBalance = async () => {
    if (!user) return;
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const previousDate = new Date(currentYear, currentMonth - 2, 1);
      const previousMonth = previousDate.getMonth() + 1;
      const previousYear = previousDate.getFullYear();
      
      const { data: previousMonthData } = await supabase
        .from('monthly_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', previousMonth)
        .eq('year', previousYear)
        .maybeSingle();
      
      let openingBalance = 0;
      
      const prevData = previousMonthData as unknown as DbMonthlyBalance | null;
      
      if (prevData && prevData.is_closed) {
        openingBalance = prevData.closing_balance;
      } else if (prevData && !prevData.is_closed) {
        await performMonthlyClosing(previousMonth, previousYear);
        openingBalance = prevData.total_income - prevData.total_expenses + prevData.opening_balance;
      }
      
      const { data, error } = await supabase
        .from('monthly_balances')
        .insert({
          user_id: user.id,
          month: currentMonth,
          year: currentYear,
          opening_balance: openingBalance,
          total_income: 0,
          total_expenses: 0,
          closing_balance: openingBalance,
          is_closed: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const dbData = data as unknown as DbMonthlyBalance;
      setCurrentMonthBalance({
        id: dbData.id,
        user_id: dbData.user_id,
        month: dbData.month,
        year: dbData.year,
        opening_balance: dbData.opening_balance,
        total_income: dbData.total_income,
        total_expenses: dbData.total_expenses,
        closing_balance: dbData.closing_balance,
        is_closed: dbData.is_closed,
        created_at: dbData.created_at,
        updated_at: dbData.updated_at
      });
    } catch (error) {
      console.error('Error creating current month balance:', error);
    }
  };

  const performMonthlyClosing = async (month: number, year: number) => {
    if (!user) return;
    
    try {
      const { data: monthTransactions, error: transError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);
      
      if (transError) throw transError;
      
      const dbTransactions = monthTransactions as unknown as DbTransaction[];
      
      const totalIncome = (dbTransactions || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = (dbTransactions || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const { data: monthlyBalance, error: balanceError } = await supabase
        .from('monthly_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();
      
      if (balanceError) throw balanceError;
      
      const balanceData = monthlyBalance as unknown as DbMonthlyBalance | null;
      const openingBalance = balanceData?.opening_balance || 0;
      const closingBalance = openingBalance + totalIncome - totalExpenses;
      
      if (balanceData) {
        const { error: updateError } = await supabase
          .from('monthly_balances')
          .update({
            total_income: totalIncome,
            total_expenses: totalExpenses,
            closing_balance: closingBalance,
            is_closed: true
          })
          .eq('id', balanceData.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('monthly_balances')
          .insert({
            user_id: user.id,
            month,
            year,
            opening_balance: openingBalance,
            total_income: totalIncome,
            total_expenses: totalExpenses,
            closing_balance: closingBalance,
            is_closed: true
          });
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Fechamento Mensal",
        description: `Mês ${month}/${year} fechado com saldo final de R$ ${closingBalance.toFixed(2)}`,
      });
      
    } catch (error) {
      console.error('Error performing monthly closing:', error);
      toast({
        title: "Erro",
        description: "Erro ao realizar fechamento mensal.",
        variant: "destructive"
      });
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          description: transactionData.description,
          amount: transactionData.amount,
          category: transactionData.category,
          type: transactionData.type,
          account: transactionData.account,
          date: transactionData.date,
          payment_method: transactionData.paymentMethod || 'other',
          is_recurring: transactionData.isRecurring || false
        })
        .select()
        .single();

      if (error) throw error;

      const dbData = data as unknown as DbTransaction;
      const transformedData = {
        id: dbData.id,
        description: dbData.description,
        amount: dbData.amount,
        category: dbData.category,
        type: dbData.type as 'income' | 'expense',
        account: dbData.account,
        date: dbData.date,
        createdAt: dbData.created_at,
        paymentMethod: (dbData.payment_method || 'other') as 'pix' | 'cash' | 'debit' | 'credit' | 'transfer' | 'other',
        isRecurring: dbData.is_recurring || false
      };
      
      setTransactions(prev => [transformedData, ...prev]);
      await updateAccountBalance(transactionData.account, transactionData.amount, transactionData.type);
      
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Error in addTransaction:', error);
    }
  };

  const updateTransaction = async (id: string, transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const originalTransaction = transactions.find(t => t.id === id);
      if (!originalTransaction) throw new Error('Transação não encontrada');
      
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          description: transactionData.description,
          amount: transactionData.amount,
          category: transactionData.category,
          type: transactionData.type,
          account: transactionData.account,
          date: transactionData.date,
          payment_method: transactionData.paymentMethod || 'other',
          is_recurring: transactionData.isRecurring || false
        })
        .eq('id', id);

      if (error) throw error;

      const transformedData = {
        id: id,
        description: transactionData.description,
        amount: transactionData.amount,
        category: transactionData.category,
        type: transactionData.type,
        account: transactionData.account,
        date: transactionData.date,
        createdAt: originalTransaction.createdAt,
        paymentMethod: transactionData.paymentMethod,
        isRecurring: transactionData.isRecurring
      };
      
      setTransactions(prev => prev.map(t => t.id === id ? transformedData : t));

      const revertType = originalTransaction.type === 'income' ? 'expense' : 'income';
      await updateAccountBalance(originalTransaction.account, originalTransaction.amount, revertType);
      await updateAccountBalance(transactionData.account, transactionData.amount, transactionData.type);
      
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error in updateTransaction:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação.",
        variant: "destructive"
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const transaction = transactions.find(t => t.id === id);
      
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));

      if (transaction) {
        const revertType = transaction.type === 'income' ? 'expense' : 'income';
        await updateAccountBalance(transaction.account, transaction.amount, revertType);
      }
      
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
    } catch (error) {
      console.error('Error in deleteTransaction:', error);
    }
  };

  const updateAccountBalance = async (accountId: string, amount: number, type: 'income' | 'expense') => {
    try {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return;

      const balanceChange = type === 'income' ? amount : -amount;
      const newBalance = account.balance + balanceChange;

      const { error } = await supabase
        .from('financial_accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      ));
    } catch (error) {
      console.error('Error updating account balance:', error);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('financial_accounts')
        .insert({
          user_id: user.id,
          name: accountData.name,
          type: accountData.type,
          balance: accountData.balance
        })
        .select()
        .single();

      if (error) throw error;

      const dbData = data as unknown as DbAccount;
      const transformedData = {
        id: dbData.id,
        name: dbData.name,
        type: dbData.type as 'checking' | 'savings' | 'credit' | 'investment',
        balance: dbData.balance
      };
      
      setAccounts(prev => [...prev, transformedData]);

      toast({
        title: "Sucesso",
        description: "Conta adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Error in addAccount:', error);
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('financial_accounts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, ...updates } : acc
      ));
    } catch (error) {
      console.error('Error in updateAccount:', error);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) return;

    try {
      const { data: relatedTransactions } = await supabase
        .from('financial_transactions')
        .select('id')
        .eq('account', id);

      if (relatedTransactions && relatedTransactions.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir conta que possui transações. Exclua as transações primeiro.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('financial_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== id));

      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso!",
      });
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conta.",
        variant: "destructive"
      });
    }
  };

  const addGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user.id,
          name: goalData.title,
          target_amount: goalData.targetAmount,
          current_amount: goalData.currentAmount,
          target_date: goalData.deadline,
          category: goalData.category || 'general',
          type: goalData.type || 'savings'
        })
        .select()
        .single();

      if (error) throw error;

      const dbData = data as unknown as DbGoal;
      const transformedData = {
        id: dbData.id,
        title: dbData.name,
        targetAmount: dbData.target_amount,
        currentAmount: dbData.current_amount,
        deadline: dbData.target_date,
        category: dbData.category || 'general',
        type: (dbData.type || 'savings') as 'savings' | 'expense_limit'
      };
      
      setGoals(prev => [...prev, transformedData]);

      toast({
        title: "Sucesso",
        description: "Meta adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Error in addGoal:', error);
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.name = updates.title;
      if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
      if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
      if (updates.deadline !== undefined) dbUpdates.target_date = updates.deadline;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.type !== undefined) dbUpdates.type = updates.type;

      const { error } = await supabase
        .from('financial_goals')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      ));

      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error in updateGoal:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar meta.",
        variant: "destructive"
      });
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));

      toast({
        title: "Sucesso",
        description: "Meta excluída com sucesso!",
      });
    } catch (error) {
      console.error('Error in deleteGoal:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir meta.",
        variant: "destructive"
      });
    }
  };

  const addContributionToGoal = async (goalId: string, amount: number, description?: string) => {
    if (!user) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newCurrentAmount = goal.currentAmount + amount;
      await updateGoal(goalId, { currentAmount: newCurrentAmount });

      await addGoalMovement({
        goal_id: goalId,
        movement_type: 'contribution',
        amount: amount,
        description: description || `Contribuição de R$ ${amount.toFixed(2)}`,
        balance_after: newCurrentAmount
      });

      toast({
        title: "Sucesso",
        description: `Contribuição de R$ ${amount.toFixed(2)} adicionada à meta!`,
      });
    } catch (error) {
      console.error('Error in addContributionToGoal:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar contribuição.",
        variant: "destructive"
      });
    }
  };

  const updateGoalContribution = async (goalId: string, amount: number, description?: string) => {
    if (!user) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newCurrentAmount = goal.currentAmount + amount;
      
      if (newCurrentAmount < 0) {
        toast({
          title: "Erro",
          description: "O saldo da meta não pode ficar negativo.",
          variant: "destructive"
        });
        return;
      }

      await updateGoal(goalId, { currentAmount: newCurrentAmount });

      const movementType = amount >= 0 ? 'contribution' : 'withdrawal';
      const absAmount = Math.abs(amount);
      const actionDescription = amount >= 0 ? `Contribuição de R$ ${absAmount.toFixed(2)}` : `Retirada de R$ ${absAmount.toFixed(2)}`;
      
      await addGoalMovement({
        goal_id: goalId,
        movement_type: movementType,
        amount: absAmount,
        description: description || actionDescription,
        balance_after: newCurrentAmount
      });

      const action = amount >= 0 ? "adicionado" : "retirado";
      
      toast({
        title: "Sucesso",
        description: `R$ ${absAmount.toFixed(2)} ${action} da meta!`,
      });
    } catch (error) {
      console.error('Error in updateGoalContribution:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contribuição.",
        variant: "destructive"
      });
    }
  };

  const calculateGoalProgress = async () => {
    if (!user) return;

    try {
      await loadGoals();
      
      toast({
        title: "Sucesso",
        description: "Progresso das metas atualizado!",
      });
    } catch (error) {
      console.error('Error in calculateGoalProgress:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar progresso das metas.",
        variant: "destructive"
      });
    }
  };

  const addBill = async (billData: { description: string; amount: number; dueDate: string; category: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bills')
        .insert({
          user_id: user.id,
          description: billData.description,
          amount: billData.amount,
          due_date: billData.dueDate,
          category: billData.category,
          is_paid: false
        })
        .select()
        .single();

      if (error) throw error;

      setBills(prev => [...prev, data as unknown as Bill]);

      toast({
        title: "Sucesso",
        description: "Conta adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Error in addBill:', error);
    }
  };

  const markBillAsPaid = async (id: string) => {
    if (!user) return;

    try {
      const bill = bills.find(b => b.id === id);
      if (!bill) throw new Error('Conta não encontrada');

      const { error: billError } = await supabase
        .from('bills')
        .update({ is_paid: true })
        .eq('id', id);

      if (billError) throw billError;

      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          description: bill.description,
          amount: bill.amount,
          category: bill.category,
          type: 'expense',
          account: accounts[0]?.id || '',
          date: new Date().toISOString().split('T')[0]
        });

      if (transactionError) throw transactionError;

      setBills(prev => prev.map(b => 
        b.id === id ? { ...b, is_paid: true } : b
      ));

      await loadTransactions();

      toast({
        title: "Sucesso",
        description: "Conta marcada como paga e adicionada ao histórico de transações!",
      });
    } catch (error) {
      console.error('Error in markBillAsPaid:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar conta como paga.",
        variant: "destructive"
      });
    }
  };

  const updateBill = async (id: string, billData: { description: string; amount: number; dueDate: string; category: string }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bills')
        .update({
          description: billData.description,
          amount: billData.amount,
          due_date: billData.dueDate,
          category: billData.category
        })
        .eq('id', id);

      if (error) throw error;

      setBills(prev => prev.map(bill => 
        bill.id === id ? { 
          ...bill, 
          description: billData.description,
          amount: billData.amount,
          due_date: billData.dueDate,
          category: billData.category
        } : bill
      ));

      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error in updateBill:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conta.",
        variant: "destructive"
      });
    }
  };

  const deleteBill = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBills(prev => prev.filter(bill => bill.id !== id));

      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso!",
      });
    } catch (error) {
      console.error('Error in deleteBill:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conta.",
        variant: "destructive"
      });
    }
  };

  const sendWhatsAppReminder = async (billId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-notifications', {
        body: {
          action: 'send_bill_reminder',
          billId: billId
        }
      });

      if (error) throw error;

      toast({
        title: "Lembrete enviado!",
        description: data?.message || "Lembrete enviado via WhatsApp.",
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar lembrete. Verifique se o WhatsApp está configurado.",
        variant: "destructive"
      });
    }
  };

  // Goal movements functions - Now using Supabase
  const loadGoalMovements = async (goalId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('goal_movements')
        .select('*')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dbData = data as unknown as DbGoalMovement[];
      const movements: GoalMovement[] = (dbData || []).map(item => ({
        id: item.id,
        goal_id: item.goal_id,
        user_id: item.user_id,
        movement_type: item.movement_type as 'contribution' | 'withdrawal' | 'edit',
        amount: item.amount,
        description: item.description || undefined,
        balance_after: item.balance_after,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setGoalMovements(movements);
    } catch (error) {
      console.error('Error loading goal movements:', error);
      setGoalMovements([]);
    }
  };

  const addGoalMovement = async (movementData: GoalMovementData) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('goal_movements')
        .insert({
          goal_id: movementData.goal_id,
          user_id: user.id,
          movement_type: movementData.movement_type,
          amount: movementData.amount,
          description: movementData.description,
          balance_after: movementData.balance_after
        })
        .select()
        .single();

      if (error) throw error;

      const dbData = data as unknown as DbGoalMovement;
      const newMovement: GoalMovement = {
        id: dbData.id,
        goal_id: dbData.goal_id,
        user_id: dbData.user_id,
        movement_type: dbData.movement_type as 'contribution' | 'withdrawal' | 'edit',
        amount: dbData.amount,
        description: dbData.description || undefined,
        balance_after: dbData.balance_after,
        created_at: dbData.created_at,
        updated_at: dbData.updated_at
      };
      
      setGoalMovements(prev => [newMovement, ...prev.filter(m => m.goal_id === movementData.goal_id)]);
    } catch (error) {
      console.error('Error adding goal movement:', error);
    }
  };

  const clearGoalMovements = async (goalId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('goal_movements')
        .delete()
        .eq('goal_id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setGoalMovements(prev => prev.filter(movement => movement.goal_id !== goalId));

      toast({
        title: "Sucesso",
        description: "Histórico de movimentações limpo com sucesso!",
      });
    } catch (error) {
      console.error('Error clearing goal movements:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar histórico de movimentações.",
        variant: "destructive"
      });
    }
  };

  return {
    // Data
    transactions,
    accounts,
    goals,
    bills,
    goalMovements,
    currentMonthBalance,
    loading,
    
    // Functions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    addGoal,
    updateGoal,
    deleteGoal,
    addContributionToGoal,
    updateGoalContribution,
    calculateGoalProgress,
    addBill,
    markBillAsPaid,
    updateBill,
    deleteBill,
    sendWhatsAppReminder,
    loadAllData,
    performMonthlyClosing,
    getOrCreateCurrentMonthBalance,
    // Goal movements functions
    loadGoalMovements,
    addGoalMovement,
    clearGoalMovements
  };
}
