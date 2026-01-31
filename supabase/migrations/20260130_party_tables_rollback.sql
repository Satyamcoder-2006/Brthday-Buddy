-- Rollback script for party hosting feature
-- Run this ONLY if you need to completely remove party features

-- Drop policies first
DROP POLICY IF EXISTS "Hosts view party invitations" ON party_invitations;
DROP POLICY IF EXISTS "Guests manage own RSVP" ON party_invitations;
DROP POLICY IF EXISTS "Public read for parties" ON parties;
DROP POLICY IF EXISTS "Hosts manage their parties" ON parties;

-- Drop triggers
DROP TRIGGER IF EXISTS update_party_invitations_updated_at ON party_invitations;
DROP TRIGGER IF EXISTS update_parties_updated_at ON parties;

-- Drop tables (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS party_invitations CASCADE;
DROP TABLE IF EXISTS parties CASCADE;

-- Note: The update_updated_at_column() function is kept as it might be used elsewhere
