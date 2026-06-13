-- Allow editors to insert meal_config row (needed for upsert if row is missing)
CREATE POLICY "Editors can insert meal config"
  ON meal_config FOR INSERT TO authenticated
  WITH CHECK (public.can_edit());
