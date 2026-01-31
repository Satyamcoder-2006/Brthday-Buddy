/**
 * Party Service
 * 
 * Handles all party-related operations including CRUD, RSVPs, and guest management
 */

import { supabase } from './supabase';
import { Party, PartyInvitation } from '../types';

/**
 * Create a new party
 */
export async function createParty(partyData: Partial<Party>): Promise<Party> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('parties')
        .insert({
            ...partyData,
            host_user_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get party by ID
 */
export async function getParty(partyId: string): Promise<Party | null> {
    const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('id', partyId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }
    return data;
}

/**
 * Get all parties hosted by current user
 */
export async function getMyHostedParties(): Promise<Party[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('host_user_id', user.id)
        .order('party_date', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get parties for a specific birthday
 */
export async function getPartiesForBirthday(birthdayId: string): Promise<Party[]> {
    const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('birthday_id', birthdayId)
        .order('party_date', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Update party details
 */
export async function updateParty(partyId: string, updates: Partial<Party>): Promise<Party> {
    const { data, error } = await supabase
        .from('parties')
        .update(updates)
        .eq('id', partyId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a party
 */
export async function deleteParty(partyId: string): Promise<void> {
    const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', partyId);

    if (error) throw error;
}

/**
 * Submit RSVP for a party
 */
export async function submitRSVP(
    partyId: string,
    rsvpData: Partial<PartyInvitation>
): Promise<PartyInvitation> {
    // Check if party exists and get current guest count
    const party = await getParty(partyId);
    if (!party) throw new Error('Party not found');

    // Validate party date is in the future
    if (new Date(party.party_date) < new Date()) {
        throw new Error('This party has already passed');
    }

    // Check max guests limit
    const currentGuests = await getPartyGuestCount(partyId);
    const requestedGuests = rsvpData.guests_count || 1;

    if (rsvpData.rsvp_status === 'accepted' && currentGuests + requestedGuests > party.max_guests) {
        throw new Error(`Party is full (${currentGuests}/${party.max_guests} guests)`);
    }

    // Rate limiting check (simple implementation)
    if (rsvpData.guest_email) {
        const recentRSVPs = await getRecentRSVPsCount(rsvpData.guest_email);
        if (recentRSVPs >= 3) {
            throw new Error('Too many RSVP attempts. Please try again later.');
        }
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Check for existing RSVP
    let existingRSVP: PartyInvitation | null = null;
    if (rsvpData.guest_email) {
        const { data } = await supabase
            .from('party_invitations')
            .select('*')
            .eq('party_id', partyId)
            .eq('guest_email', rsvpData.guest_email)
            .maybeSingle();
        existingRSVP = data;
    }

    if (existingRSVP) {
        // Update existing RSVP
        const { data, error } = await supabase
            .from('party_invitations')
            .update({
                ...rsvpData,
                guest_user_id: user?.id,
            })
            .eq('id', existingRSVP.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        // Create new RSVP
        const { data, error } = await supabase
            .from('party_invitations')
            .insert({
                party_id: partyId,
                ...rsvpData,
                guest_user_id: user?.id,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

/**
 * Get all invitations/RSVPs for a party
 */
export async function getPartyInvitations(partyId: string): Promise<PartyInvitation[]> {
    const { data, error } = await supabase
        .from('party_invitations')
        .select('*')
        .eq('party_id', partyId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get total guest count for a party (only accepted RSVPs)
 */
export async function getPartyGuestCount(partyId: string): Promise<number> {
    const { data, error } = await supabase
        .from('party_invitations')
        .select('guests_count')
        .eq('party_id', partyId)
        .eq('rsvp_status', 'accepted');

    if (error) throw error;

    return data?.reduce((total: number, invitation: any) => total + (invitation.guests_count || 0), 0) || 0;
}

/**
 * Get recent RSVP count for rate limiting
 */
async function getRecentRSVPsCount(email: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('party_invitations')
        .select('id')
        .eq('guest_email', email)
        .gte('created_at', oneHourAgo);

    if (error) return 0;
    return data?.length || 0;
}

/**
 * Generate shareable invitation link
 */
export function generateInvitationLink(partyId: string, userId: string): string {
    const domain = process.env.EXPO_PUBLIC_DEEP_LINK_DOMAIN || 'birthdaybuddy.app';
    return `https://${domain}/party/${partyId}?inviter=${userId}`;
}

/**
 * Join party from invite link
 */
export async function joinPartyFromInvite(
    partyId: string,
    userId: string,
    inviterId?: string
): Promise<{ success: boolean; party: Party | null; error?: any }> {
    try {
        // 1. Get party details
        const party = await getParty(partyId);
        if (!party) throw new Error('Party not found');

        // 2. Check if already joined
        const { data: existing } = await supabase
            .from('party_invitations')
            .select('*')
            .eq('party_id', partyId)
            .eq('guest_user_id', userId)
            .maybeSingle();

        if (existing) {
            return { success: true, party };
        }

        // 3. Add as guest
        const { data: userData } = await supabase.auth.getUser();

        const { error: inviteError } = await supabase
            .from('party_invitations')
            .upsert({
                party_id: partyId,
                guest_user_id: userId,
                guest_name: userData.user?.user_metadata?.name || userData.user?.email?.split('@')[0] || 'Guest',
                guest_email: userData.user?.email,
                rsvp_status: 'accepted',
                guests_count: 1
            });

        if (inviteError) throw inviteError;

        return { success: true, party };
    } catch (error) {
        console.error('Failed to join party from invite:', error);
        return { success: false, party: null, error };
    }
}

/**
 * Get party by ID with guest list
 */
export async function getPartyWithGuests(partyId: string): Promise<{
    party: Party;
    invitations: PartyInvitation[];
    guestCount: number;
}> {
    const party = await getParty(partyId);
    if (!party) throw new Error('Party not found');

    const invitations = await getPartyInvitations(partyId);
    const guestCount = await getPartyGuestCount(partyId);

    return { party, invitations, guestCount };
}
