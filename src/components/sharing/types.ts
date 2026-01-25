
export type LayoutId = 'minimal_elegance' | 'gradient_waves' | 'confetti_burst' | 'retro_neon' | 'floral_dream' | 'geometric_modern' | 'balloon_party' | 'starry_night' | 'glassmorphism' | 'glitch_cyber';

export type ColorTheme = 'sunset' | 'ocean' | 'forest' | 'rose' | 'midnight' | 'candy' | 'lavender' | 'cosmic';

export interface CardElement {
    id: string;
    type: 'sticker' | 'text';
    content: string; // emoji icon or text string
    x: number;
    y: number;
    scale: number;
    rotation: number;
    fontSize?: number;
    color?: string;
}

export interface CardState {
    layoutId: LayoutId;
    theme: ColorTheme;
    customMessage: string;
    photoUri?: string | null;
    showPhoto: boolean;
    elements: CardElement[];
}

export interface BirthdayInfo {
    name: string;
    age: number;
    photoUrl?: string | null;
}
