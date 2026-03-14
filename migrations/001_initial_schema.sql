-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  xp INTEGER DEFAULT 0,
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'platinum', 'legend')),
  rating DECIMAL(3,2) DEFAULT 0.00,
  rank_position INTEGER,
  kyc_status TEXT DEFAULT 'not_started' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'not_started')),
  kyc_data JSONB,
  verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT UNIQUE,
  verification_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_kyc_status ON public.users(kyc_status);
CREATE INDEX idx_users_level ON public.users(level);

-- Found Items Table
CREATE TABLE public.found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('document', 'electronic', 'key', 'other')),
  description TEXT,
  photo_url TEXT,
  photo_urls TEXT[], -- For multiple photos
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  finder_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'in_delivery', 'delivered', 'closed')),
  reward_value DECIMAL(10,2) DEFAULT 0,
  matched_items UUID[], -- IDs of possibly matching lost items
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_found_items_finder_id ON public.found_items(finder_id);
CREATE INDEX idx_found_items_status ON public.found_items(status);
CREATE INDEX idx_found_items_category ON public.found_items(category);
CREATE INDEX idx_found_items_city ON public.found_items(city);
CREATE INDEX idx_found_items_created ON public.found_items(created_at DESC);

-- Lost Items (User reports)
CREATE TABLE public.lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('document', 'electronic', 'key', 'other')),
  description TEXT,
  photo_url TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'found', 'cancelled')),
  reward_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_lost_items_owner_id ON public.lost_items(owner_id);
CREATE INDEX idx_lost_items_status ON public.lost_items(status);

-- Claims Table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.found_items(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  finder_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_delivery', 'completed', 'disputed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_claims_item_id ON public.claims(item_id);
CREATE INDEX idx_claims_owner_id ON public.claims(owner_id);
CREATE INDEX idx_claims_finder_id ON public.claims(finder_id);
CREATE INDEX idx_claims_status ON public.claims(status);

-- Payments Table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  finder_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  provider TEXT DEFAULT 'stripe',
  transaction_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payments_claim_id ON public.payments(claim_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id);

-- Activities Table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reward_received', 'item_registered', 'badge_earned', 'level_up', 'claim_completed')),
  description TEXT NOT NULL,
  value INTEGER DEFAULT 0,
  related_entity_id UUID,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_type ON public.activities(type);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);

-- Badges Table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT,
  xp_required INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- User Badges Junction Table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON public.user_badges(badge_id);

-- Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('claim_received', 'claim_updated', 'payment_released', 'new_match')),
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::uuid = id);

-- RLS Policies for found_items
CREATE POLICY "Anyone can view found items" ON public.found_items
  FOR SELECT USING (true);

CREATE POLICY "Users can insert found items" ON public.found_items
  FOR INSERT WITH CHECK (auth.uid()::uuid = finder_id);

CREATE POLICY "Users can update their own found items" ON public.found_items
  FOR UPDATE USING (auth.uid()::uuid = finder_id);

-- RLS Policies for claims
CREATE POLICY "Users can view their own claims" ON public.claims
  FOR SELECT USING (auth.uid()::uuid IN (owner_id, finder_id));

CREATE POLICY "Users can create claims" ON public.claims
  FOR INSERT WITH CHECK (auth.uid()::uuid = owner_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::uuid = user_id);

-- Create Realtime subscriptions for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE claims;

-- Insert initial badges
INSERT INTO public.badges (name, icon, description, xp_required) VALUES
  ('Primeiro Item', '🎯', 'Registrou seu primeiro item encontrado', 0),
  ('Bom Samaritano', '❤️', 'Completou 5 devoluções', 100),
  ('Super Localizador', '🔍', 'Completou 25 devoluções', 500),
  ('Herói do Dia', '⭐', 'Recebeu 5 avaliações 5 estrelas', 200),
  ('Rápido e Furioso', '⚡', 'Completou devolução em menos de 24h', 150),
  ('Lenda Urbana', '👑', 'Atingiu o rank Platinum', 1000);
