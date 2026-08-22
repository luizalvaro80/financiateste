# Sistema de Fechamento Mensal - Instruções de Implementação

## 📋 Visão Geral

O sistema de fechamento mensal foi implementado para automatizar o controle financeiro por períodos mensais. Agora o Dashboard mostra apenas dados do mês atual, e o sistema mantém um histórico de saldos mensais.

## 🚀 Passo a Passo para Ativação

### 1. Criar a Tabela no Supabase

Execute o SQL abaixo no **SQL Editor** do seu projeto Supabase:

```sql
-- Create monthly_balances table
CREATE TABLE IF NOT EXISTS public.monthly_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    opening_balance DECIMAL(15, 2) DEFAULT 0.00,
    total_income DECIMAL(15, 2) DEFAULT 0.00,
    total_expenses DECIMAL(15, 2) DEFAULT 0.00,
    closing_balance DECIMAL(15, 2) DEFAULT 0.00,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_balances_user_id ON public.monthly_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_balances_year_month ON public.monthly_balances(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_balances_user_year_month ON public.monthly_balances(user_id, year, month);

-- Enable RLS
ALTER TABLE public.monthly_balances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own monthly balances" ON public.monthly_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly balances" ON public.monthly_balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly balances" ON public.monthly_balances
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly balances" ON public.monthly_balances
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_monthly_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_monthly_balances_updated_at
    BEFORE UPDATE ON public.monthly_balances
    FOR EACH ROW EXECUTE FUNCTION update_monthly_balances_updated_at();
```

### 2. Verificar Funcionamento

Após executar o SQL:

1. **Recarregue a página** da aplicação
2. O sistema irá automaticamente:
   - Detectar que a tabela foi criada
   - Inicializar o saldo do mês atual
   - Filtrar transações apenas do mês atual no Dashboard

### 3. Funcionalidades Implementadas

#### ✅ Dashboard com Filtro Mensal
- **Receitas**: Apenas do mês atual
- **Despesas**: Apenas do mês atual  
- **Saldo**: Saldo inicial + receitas - despesas do mês
- **Transações**: Contagem apenas do mês atual

#### ✅ Fechamento Automático
- Acontece automaticamente ao acessar o sistema em um novo mês
- Calcula saldo final do mês anterior
- Transfere saldo como saldo inicial do novo mês

#### ✅ Gestão Manual de Fechamento
- Acesse a aba "Contas" para ver o componente de fechamento mensal
- Possibilidade de forçar fechamento de meses anteriores
- Visualização do status do mês atual

## 📊 Como Funciona

### Fluxo Automático
1. **Fim do mês**: Sistema detecta mudança de mês
2. **Cálculo**: Soma receitas e despesas do mês que acabou
3. **Fechamento**: Salva saldo final na tabela monthly_balances
4. **Novo mês**: Cria registro com saldo inicial = saldo final anterior
5. **Dashboard**: Zera e mostra apenas dados do mês atual

### Preservação de Dados
- ✅ **Transações históricas**: Mantidas intactas
- ✅ **Saldos mensais**: Salvos na nova tabela
- ✅ **Independência**: Metas financeiras não são afetadas

## 🔧 Estrutura da Tabela monthly_balances

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID | Referência ao usuário |
| `month` | INTEGER | Mês (1-12) |
| `year` | INTEGER | Ano |
| `opening_balance` | DECIMAL | Saldo inicial do mês |
| `total_income` | DECIMAL | Total de receitas do mês |
| `total_expenses` | DECIMAL | Total de despesas do mês |
| `closing_balance` | DECIMAL | Saldo final do mês |
| `is_closed` | BOOLEAN | Se o mês foi fechado |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

## 🎯 Validações Implementadas

1. **Unicidade**: Um registro por usuário/mês/ano
2. **Segurança**: RLS ativo - usuários só veem seus dados
3. **Integridade**: Checks em mês (1-12) e ano (>=2020)
4. **Performance**: Índices otimizados para consultas

## 🧪 Testes Recomendados

1. **Criar transações** no mês atual
2. **Simular mudança de mês** (alterar data do sistema)
3. **Verificar fechamento automático**
4. **Confirmar que Dashboard mostra apenas mês atual**
5. **Testar fechamento manual** via interface

## ❗ Observações Importantes

- Sistema funciona apenas após criação da tabela
- Fechamento é irreversível (dados são preservados, mas mês fica fechado)
- Transações de meses fechados podem ter validações futuras
- Sistema é compatível com dados existentes

## 🐛 Troubleshooting

**Problema**: Dashboard não filtra por mês
**Solução**: Verifique se a tabela monthly_balances foi criada

**Problema**: Erro ao carregar dados
**Solução**: Execute o SQL novamente e recarregue a página

**Problema**: Saldos incorretos
**Solução**: Use o fechamento manual para recalcular