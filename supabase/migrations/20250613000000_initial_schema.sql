-- Family Meal Planner schema

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE meal_slot AS ENUM ('breakfast', 'lunch', 'dinner');
CREATE TYPE dish_tag AS ENUM ('veg', 'meat', 'seafood', 'soup', 'starch', 'other');
CREATE TYPE inventory_category AS ENUM ('veg', 'meat', 'seafood', 'other');
CREATE TYPE meal_plan_status AS ENUM ('draft', 'confirmed');
CREATE TYPE app_locale AS ENUM ('en', 'zh-CN');

-- Family allowlist (must exist before first login)
CREATE TABLE family_allowlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  locale app_locale NOT NULL DEFAULT 'zh-CN',
  timezone TEXT NOT NULL DEFAULT 'Asia/Singapore',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dishes library
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meal_types meal_slot[] NOT NULL DEFAULT '{}',
  tags dish_tag[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dishes_name ON dishes(name);

-- Meal plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL UNIQUE,
  status meal_plan_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meal_plans_date ON meal_plans(plan_date DESC);

-- Meal plan items
CREATE TABLE meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  meal_slot meal_slot NOT NULL,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE RESTRICT,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(plan_id, meal_slot, dish_id)
);

CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items(plan_id);

-- Inventory
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category inventory_category NOT NULL DEFAULT 'other',
  quantity NUMERIC,
  unit TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_category ON inventory_items(category);

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.can_edit()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'editor') FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Auto-create profile on signup (respect allowlist role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed_role user_role;
  admin_emails TEXT[];
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

  INSERT INTO profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    allowed_role
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE family_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile locale/timezone"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile role"
  ON profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allowlist policies
CREATE POLICY "Authenticated users can view allowlist"
  ON family_allowlist FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert allowlist"
  ON family_allowlist FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete allowlist"
  ON family_allowlist FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update allowlist"
  ON family_allowlist FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Dishes policies
CREATE POLICY "All authenticated can view dishes"
  ON dishes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Editors can insert dishes"
  ON dishes FOR INSERT TO authenticated
  WITH CHECK (public.can_edit());

CREATE POLICY "Editors can update dishes"
  ON dishes FOR UPDATE TO authenticated
  USING (public.can_edit())
  WITH CHECK (public.can_edit());

CREATE POLICY "Editors can delete dishes"
  ON dishes FOR DELETE TO authenticated
  USING (public.can_edit());

-- Meal plans policies
CREATE POLICY "All authenticated can view meal plans"
  ON meal_plans FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Editors can insert meal plans"
  ON meal_plans FOR INSERT TO authenticated
  WITH CHECK (public.can_edit());

CREATE POLICY "Editors can update meal plans"
  ON meal_plans FOR UPDATE TO authenticated
  USING (public.can_edit())
  WITH CHECK (public.can_edit());

CREATE POLICY "Editors can delete meal plans"
  ON meal_plans FOR DELETE TO authenticated
  USING (public.can_edit());

-- Meal plan items policies
CREATE POLICY "All authenticated can view meal plan items"
  ON meal_plan_items FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Editors can insert meal plan items"
  ON meal_plan_items FOR INSERT TO authenticated
  WITH CHECK (public.can_edit());

CREATE POLICY "Editors can update meal plan items"
  ON meal_plan_items FOR UPDATE TO authenticated
  USING (public.can_edit())
  WITH CHECK (public.can_edit());

CREATE POLICY "Editors can delete meal plan items"
  ON meal_plan_items FOR DELETE TO authenticated
  USING (public.can_edit());

-- Inventory policies
CREATE POLICY "All authenticated can view inventory"
  ON inventory_items FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Editors can insert inventory"
  ON inventory_items FOR INSERT TO authenticated
  WITH CHECK (public.can_edit());

CREATE POLICY "Editors can update inventory"
  ON inventory_items FOR UPDATE TO authenticated
  USING (public.can_edit())
  WITH CHECK (public.can_edit());

CREATE POLICY "Editors can delete inventory"
  ON inventory_items FOR DELETE TO authenticated
  USING (public.can_edit());

-- Seed sample dishes (optional starter data)
INSERT INTO dishes (name, meal_types, tags) VALUES
  ('Steamed buns', ARRAY['breakfast']::meal_slot[], ARRAY['starch']::dish_tag[]),
  ('Dumplings', ARRAY['breakfast']::meal_slot[], ARRAY['starch', 'meat']::dish_tag[]),
  ('Banana cake', ARRAY['breakfast']::meal_slot[], ARRAY['starch']::dish_tag[]),
  ('Soy milk', ARRAY['breakfast']::meal_slot[], ARRAY['other']::dish_tag[]),
  ('Congee', ARRAY['breakfast', 'lunch']::meal_slot[], ARRAY['starch']::dish_tag[]),
  ('Stir-fry greens', ARRAY['lunch', 'dinner']::meal_slot[], ARRAY['veg']::dish_tag[]),
  ('Tomato egg', ARRAY['lunch', 'dinner']::meal_slot[], ARRAY['veg']::dish_tag[]),
  ('Kung pao chicken', ARRAY['lunch', 'dinner']::meal_slot[], ARRAY['meat']::dish_tag[]),
  ('Steamed fish', ARRAY['dinner']::meal_slot[], ARRAY['seafood']::dish_tag[]),
  ('Pork rib soup', ARRAY['dinner']::meal_slot[], ARRAY['soup', 'meat']::dish_tag[]),
  ('Winter melon soup', ARRAY['dinner']::meal_slot[], ARRAY['soup', 'veg']::dish_tag[]),
  ('Mapo tofu', ARRAY['lunch', 'dinner']::meal_slot[], ARRAY['veg', 'meat']::dish_tag[]),
  ('Fried rice', ARRAY['lunch']::meal_slot[], ARRAY['starch']::dish_tag[]),
  ('Noodles', ARRAY['lunch']::meal_slot[], ARRAY['starch']::dish_tag[]);
