-- Allow unauthenticated (helper) read-only access to meals and inventory

CREATE POLICY "Anon can view meal plans"
  ON meal_plans FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can view meal plan items"
  ON meal_plan_items FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can view dishes"
  ON dishes FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can view inventory"
  ON inventory_items FOR SELECT TO anon
  USING (true);
