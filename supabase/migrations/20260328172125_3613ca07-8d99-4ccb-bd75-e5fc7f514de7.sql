
-- Drop the permissive user update policy
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create a restricted update policy that prevents users from changing sensitive fields
-- Users can only update: name, email, whatsapp_number
-- They CANNOT change: approved, status, subscription_due_date, last_payment_date
CREATE POLICY "Users can update own safe profile fields"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND approved = (SELECT up.approved FROM user_profiles up WHERE up.user_id = auth.uid())
    AND status = (SELECT up.status FROM user_profiles up WHERE up.user_id = auth.uid())
    AND subscription_due_date IS NOT DISTINCT FROM (SELECT up.subscription_due_date FROM user_profiles up WHERE up.user_id = auth.uid())
    AND last_payment_date IS NOT DISTINCT FROM (SELECT up.last_payment_date FROM user_profiles up WHERE up.user_id = auth.uid())
  );
