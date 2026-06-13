-- Meal configuration (singleton) + viewer default locale

CREATE TABLE meal_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL DEFAULT '{
    "breakfast": {"totalCount": 2, "tagMinimums": {"veg": 0, "meat": 0, "soup": 0}},
    "lunch": {"totalCount": 3, "tagMinimums": {"veg": 0, "meat": 0, "soup": 0}},
    "dinner": {"totalCount": 4, "tagMinimums": {"veg": 1, "meat": 1, "soup": 1}}
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO meal_config (id) VALUES (1);

ALTER TABLE meal_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view meal config"
  ON meal_config FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Editors can update meal config"
  ON meal_config FOR UPDATE TO authenticated
  USING (public.can_edit())
  WITH CHECK (public.can_edit());

CREATE POLICY "Anon can view meal config"
  ON meal_config FOR SELECT TO anon
  USING (true);

-- Viewers default to English on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed_role user_role;
  admin_emails TEXT[];
  default_locale app_locale;
BEGIN
  SELECT role INTO allowed_role
  FROM family_allowlist
  WHERE lower(email) = lower(NEW.email);

  IF allowed_role IS NULL THEN
    RAISE EXCEPTION 'Email not on family allowlist';
  END IF;

  admin_emails := string_to_array(
    coalesce(current_setting('app.initial_admin_emails', true), ''),
    ','
  );

  IF lower(NEW.email) = ANY(
    SELECT lower(trim(e)) FROM unnest(admin_emails) AS e WHERE trim(e) <> ''
  ) THEN
    allowed_role := 'admin';
  END IF;

  default_locale := CASE
    WHEN allowed_role = 'viewer' THEN 'en'::app_locale
    ELSE 'zh-CN'::app_locale
  END;

  INSERT INTO profiles (id, email, display_name, role, locale)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    allowed_role,
    default_locale
  );

  RETURN NEW;
END;
$$;

-- Existing viewers: switch to English if still on Chinese default
UPDATE profiles SET locale = 'en' WHERE role = 'viewer' AND locale = 'zh-CN';
