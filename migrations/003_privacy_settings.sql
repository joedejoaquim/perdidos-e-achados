-- Privacy Settings Table
CREATE TABLE public.user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  public_profile BOOLEAN DEFAULT TRUE,
  allow_contact BOOLEAN DEFAULT FALSE,
  items_visibility TEXT DEFAULT 'friends' CHECK (items_visibility IN ('everyone', 'friends', 'only_me')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_privacy_settings_user_id ON public.user_privacy_settings(user_id);

ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own privacy settings" ON public.user_privacy_settings
  FOR ALL USING (auth.uid()::uuid = user_id);
