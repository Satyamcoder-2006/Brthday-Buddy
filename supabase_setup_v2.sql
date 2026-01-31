-- Celebration History Table
CREATE TABLE IF NOT EXISTS celebration_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  celebration_date TIMESTAMPTZ NOT NULL,
  note TEXT,
  photo_url TEXT,
  reaction VARCHAR(10), -- Emoji reaction
  gift_given TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_celebration_birthday ON celebration_entries(birthday_id);
CREATE INDEX IF NOT EXISTS idx_celebration_date ON celebration_entries(celebration_date DESC);

-- Gift Registry Table
CREATE TABLE IF NOT EXISTS gift_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  product_name TEXT NOT NULL,
  product_url TEXT,
  price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'idea', -- 'idea', 'reserved', 'bought'
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_birthday ON gift_registry(birthday_id);

-- Enable RLS
ALTER TABLE celebration_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registry ENABLE ROW LEVEL SECURITY;

-- Policies for Celebration Entries
CREATE POLICY "Users can view their own celebration entries"
  ON celebration_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own celebration entries"
  ON celebration_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own celebration entries"
  ON celebration_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own celebration entries"
  ON celebration_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for Gift Registry
CREATE POLICY "Users can view their own gift registry"
  ON gift_registry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own gift registry"
  ON gift_registry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gift registry"
  ON gift_registry FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own gift registry"
  ON gift_registry FOR DELETE
  USING (auth.uid() = user_id);
