export type Relationship = 'Friend' | 'Family' | 'Colleague' | 'Other';

export interface Profile {
    id: string;
    name: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Birthday {
    id: string;
    user_id: string;
    name: string;
    birthday_date: string;
    relationship: Relationship;
    avatar_url?: string;
    birth_year?: number | null;
    notes?: string;
    notification_ids?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface UpcomingBirthday extends Birthday {
    diff: number;
    age: number;
}

export interface AppSettings {
    notificationsEnabled: boolean;
    oneDayPrior: boolean;
    oneHourPrior: boolean;
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
};

export type MainTabParamList = {
    Calendar: undefined;
    Birthdays: undefined;
    Settings: undefined;
};
