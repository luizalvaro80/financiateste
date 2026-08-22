-- Create goal_movements table to track all goal transactions
CREATE TABLE IF NOT EXISTS goal_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('contribution', 'withdrawal', 'edit')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  balance_after DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goal_movements_goal_id ON goal_movements(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_movements_user_id ON goal_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_movements_created_at ON goal_movements(created_at DESC);

-- Enable RLS
ALTER TABLE goal_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own goal movements" ON goal_movements
  FOR ALL USING (user_id = auth.uid());

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goal_movements_updated_at 
  BEFORE UPDATE ON goal_movements 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();