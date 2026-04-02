-- Users are handled by Supabase Auth

CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sprite_seed TEXT NOT NULL,
  personality_trait TEXT NOT NULL CHECK (personality_trait IN ('curious', 'lazy', 'chaotic', 'wholesome')),
  evolution_stage INT DEFAULT 0 CHECK (evolution_stage BETWEEN 0 AND 3),
  mood INT DEFAULT 80 CHECK (mood BETWEEN 0 AND 100),
  energy INT DEFAULT 80 CHECK (energy BETWEEN 0 AND 100),
  hunger INT DEFAULT 80 CHECK (hunger BETWEEN 0 AND 100),
  happiness INT DEFAULT 80 CHECK (happiness BETWEEN 0 AND 100),
  scene_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  scene_text TEXT NOT NULL,
  emotion TEXT NOT NULL,
  chosen_action TEXT,
  stat_delta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own characters"
  ON characters FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own story moments"
  ON story_moments FOR ALL
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_story_moments_character_id ON story_moments(character_id);
CREATE INDEX IF NOT EXISTS idx_story_moments_created_at ON story_moments(created_at DESC);
