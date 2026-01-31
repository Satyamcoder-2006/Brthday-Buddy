-- Birthday Buddy: Party Hosting Feature
-- Migration: Add parties and party_invitations tables

-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    birthday_id UUID REFERENCES birthdays(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    party_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue_name TEXT,
    venue_address TEXT,
    max_guests INTEGER NOT NULL DEFAULT 50,
    theme TEXT,
    invitation_card_theme TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create party_invitations table
CREATE TABLE IF NOT EXISTS party_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    guest_name TEXT,
    guest_email TEXT,
    guest_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rsvp_status TEXT NOT NULL CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'maybe')) DEFAULT 'pending',
    guests_count INTEGER NOT NULL DEFAULT 1,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_invitations ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parties_host_user ON parties(host_user_id);
CREATE INDEX IF NOT EXISTS idx_parties_birthday ON parties(birthday_id);
CREATE INDEX IF NOT EXISTS idx_parties_date ON parties(party_date);
CREATE INDEX IF NOT EXISTS idx_invitations_party ON party_invitations(party_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON party_invitations(guest_email);

-- Data Constraints (using DO blocks for IF NOT EXISTS logic)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_email_per_party'
    ) THEN
        ALTER TABLE party_invitations 
        ADD CONSTRAINT unique_email_per_party 
        UNIQUE(party_id, guest_email);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'valid_max_guests'
    ) THEN
        ALTER TABLE parties 
        ADD CONSTRAINT valid_max_guests 
        CHECK (max_guests > 0 AND max_guests <= 500);
    END IF;
END $$;

-- RLS Policies for parties table
DROP POLICY IF EXISTS "Hosts manage their parties" ON parties;
CREATE POLICY "Hosts manage their parties" ON parties
    FOR ALL USING (auth.uid() = host_user_id);

DROP POLICY IF EXISTS "Public read for parties" ON parties;
CREATE POLICY "Public read for parties" ON parties
    FOR SELECT USING (true);

-- RLS Policies for party_invitations table
DROP POLICY IF EXISTS "Guests manage own RSVP" ON party_invitations;
CREATE POLICY "Guests manage own RSVP" ON party_invitations
    FOR ALL USING (
        auth.uid() = guest_user_id OR 
        guest_email = auth.email()
    );

DROP POLICY IF EXISTS "Hosts view party invitations" ON party_invitations;
CREATE POLICY "Hosts view party invitations" ON party_invitations
    FOR SELECT USING (
        party_id IN (SELECT id FROM parties WHERE host_user_id = auth.uid())
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updated_at
DROP TRIGGER IF EXISTS update_parties_updated_at ON parties;
CREATE TRIGGER update_parties_updated_at
    BEFORE UPDATE ON parties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_party_invitations_updated_at ON party_invitations;
CREATE TRIGGER update_party_invitations_updated_at
    BEFORE UPDATE ON party_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
