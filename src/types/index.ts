export type Relationship = 'Friend' | 'Family' | 'Colleague' | 'Other';

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Birthday {
    id: string;
    user_id: string;
    name: string;
    birthday_date: string; // YYYY-MM-DD
    relationship: Relationship;
    notes?: string;
    avatar_url?: string;
    birth_year?: number | null;
    notification_ids?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface UpcomingBirthday extends Birthday {
    diff: number;
    age: number;
}

export type AIProvider = 'gemini' | 'mistral' | 'auto';

export interface AppSettings {
    notification_hour: number;
    reminder_days_before: number;
    ai_provider: AIProvider;
}

export interface CalendarMarking {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    dotColor?: string;
    disableTouchEvent?: boolean;
    selectedTextColor?: string;
}

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    SocialShare: { birthday: Birthday };
    BirthdayDetail: { birthday: Birthday };
    GiftRegistry: { birthday: Birthday };
    ImportPreview: { extractedData: any[] };
    PartyHosting: { birthdayId?: string; partyId?: string };
    PartyDetail: { partyId: string; fromInvite?: boolean; inviterId?: string };
    PartyJoin: { partyId: string };
    MyParties: undefined;
};

export type MainTabParamList = {
    Calendar: undefined;
    Birthdays: undefined;
    Settings: undefined;
};

export interface Party {
    id: string;
    host_user_id: string;
    birthday_id?: string;
    title: string;
    description?: string;
    party_date: string;
    venue_name?: string;
    venue_address?: string;
    max_guests: number;
    theme?: string;
    invitation_card_theme?: string;
    created_at: string;
    updated_at: string;
}

export interface PartyInvitation {
    id: string;
    party_id: string;
    guest_name?: string;
    guest_email?: string;
    guest_user_id?: string;
    rsvp_status: 'pending' | 'accepted' | 'declined' | 'maybe';
    guests_count: number;
    message?: string;
    created_at: string;
    updated_at: string;
}

