export interface GoalMovement {
  id: string;
  goal_id: string;
  user_id: string;
  movement_type: 'contribution' | 'withdrawal' | 'edit';
  amount: number;
  description?: string;
  balance_after: number;
  created_at: string;
  updated_at: string;
}

export interface GoalMovementData {
  goal_id: string;
  movement_type: 'contribution' | 'withdrawal' | 'edit';
  amount: number;
  description?: string;
  balance_after: number;
}