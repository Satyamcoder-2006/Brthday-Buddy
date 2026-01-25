import Constants from 'expo-constants';
import { Birthday } from '../types';

export interface GiftSuggestion {
    id: string;
    title: string;
    description: string;
    why: string;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || Constants.expoConfig?.extra?.geminiApiKey;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS_TO_TRY = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-flash-latest" // Ultimate fallback
];

/**
 * Attempts to repair truncated JSON by closing open brackets and braces.
 */
const fixTruncatedJson = (jsonString: string): string => {
    let text = jsonString.trim();

    // Check if it looks like an array and is truncated
    if (text.startsWith('[') && !text.endsWith(']')) {
        // Find the last completed object if any
        const lastBrace = text.lastIndexOf('}');
        if (lastBrace !== -1) {
            // Cut to the last complete object and close the array
            return text.substring(0, lastBrace + 1) + ']';
        }

        // If it's a list of strings (card messages)
        const lastQuote = text.lastIndexOf('"');
        if (lastQuote !== -1 && text.lastIndexOf(',') < lastQuote) {
            // Probably inside a string, close the string and array
            return text.substring(0, lastQuote + 1) + ']';
        }

        // Emergency fallback - just try to close it
        return text + (text.includes('{') ? '}]' : ']');
    }

    return text;
};

/**
 * Helper to call Gemini with fallback support
 */
const generateContentWithFallback = async (
    payload: any,
    context: string // 'Gift Suggestions' or 'Card Messages'
): Promise<any> => {
    let lastError: any = null;

    for (const model of MODELS_TO_TRY) {
        try {
            const endpoint = `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
            console.log(`🤖 formatRequest: Outputting request to ${model}...`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                // If 404 (Not Found) or 403 (Forbidden), we try the next model.
                // If 500/503 (Server Error), we might also want to retry, so we treat generally.
                console.warn(`⚠️ ${context}: Model ${model} failed (${response.status}).`, errorText);
                lastError = new Error(`Model ${model} error: ${response.status} ${errorText}`);
                continue; // Try next model
            }

            const result = await response.json();
            console.log(`✅ ${context}: Success with ${model}`);
            return result;
        } catch (e) {
            console.warn(`⚠️ ${context}: Network/Logic error with ${model}`, e);
            lastError = e;
        }
    }

    throw lastError || new Error('All models failed');
};

export const getGiftSuggestions = async (
    birthday: Birthday,
    budget: string,
    isDemo: boolean = false
): Promise<GiftSuggestion[]> => {
    // If no API key, use mock suggestions
    if (!GEMINI_API_KEY) {
        // Simulate network delay for AI "thinking" even for mock
        await new Promise(resolve => setTimeout(resolve, 1500));
        return getMockSuggestions(birthday, budget);
    }

    try {
        return await callGeminiAPI(birthday, budget);
    } catch (error) {
        console.error('Gemini API Error (All Models Failed):', error);
        // Graceful fallback to mock data on API error
        return getMockSuggestions(birthday, budget);
    }
};

export const getCardMessageSuggestions = async (
    birthday: Birthday
): Promise<string[]> => {
    if (!GEMINI_API_KEY) {
        return ['Happy Birthday! 🎂', 'Best Year Yet! ✨', 'HBD! 🎈', 'Cheers! 🥂', 'Legend! 👑', 'Make a Wish! 🌟'];
    }

    try {
        const age = birthday.birth_year ? new Date().getFullYear() - birthday.birth_year : 'unspecified';
        const prompt = `
            Generate 6 short and catchy birthday wishes (max 25 characters each).
            Recipient: ${birthday.name} (Relationship: ${birthday.relationship}, Age: ${age}).
            Include emojis. Return ONLY a JSON array of strings.
        `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                max_output_tokens: 512,
                response_mime_type: "application/json"
            }
        };

        const result = await generateContentWithFallback(payload, 'Card Messages');
        const text = result.candidates[0].content.parts[0].text;

        // Extract and repair JSON
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\[[\s\S]*\]/) || [text];
        const rawJsonText = jsonMatch[1] || jsonMatch[0];
        const fixedJson = fixTruncatedJson(rawJsonText);

        return JSON.parse(fixedJson.trim());
    } catch (error) {
        console.error('Message AI Error:', error);
        return ['Happy Birthday! 🎂', 'Best Year Yet! ✨', 'HBD! 🎈', 'Cheers! 🥂', 'Legend! 👑', 'Make a Wish! 🌟'];
    }
};

const callGeminiAPI = async (birthday: Birthday, budget: string): Promise<GiftSuggestion[]> => {
    const age = birthday.birth_year ? new Date().getFullYear() - birthday.birth_year : 'unspecified';

    const prompt = `
        As a personal gift assistant, suggest exactly 3 creative and personalized birthday gift ideas.
        
        CONTEXT:
        - Recipient: ${birthday.name}
        - Relationship: ${birthday.relationship}
        - Turning Age: ${age}
        - Personal Notes/Interests: ${birthday.notes || 'No specific interests noted'}
        - Budget: ${budget} (Low/Medium/High)
        
        GUIDELINES:
        1. Be creative and thoughtful based on the specific context.
        2. Format the response as a JSON array of objects.
        3. Each object must have:
           - "id" (string, e.g., "1")
           - "title" (short product/experience name)
           - "description" (max 20 words)
           - "why" (Short reasoning why this fits their profile)
        
        CRITICAL: Return ONLY the raw JSON array.
    `;

    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.7,
            top_p: 0.8,
            top_k: 40,
            max_output_tokens: 4096,
            response_mime_type: "application/json"
        }
    };

    const result = await generateContentWithFallback(payload, 'Gift Suggestions');
    const text = result.candidates[0].content.parts[0].text;

    try {
        // Extract and repair JSON
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\[[\s\S]*\]/) || [text];
        const rawJsonText = jsonMatch[1] || jsonMatch[0];
        const fixedJson = fixTruncatedJson(rawJsonText);

        const parsed = JSON.parse(fixedJson.trim());
        return Array.isArray(parsed) ? parsed : getMockSuggestions(birthday, budget);
    } catch (e) {
        console.error('Failed to parse Gemini response:', text);
        console.error('Parse error:', e);
        return getMockSuggestions(birthday, budget);
    }
};

const getMockSuggestions = (birthday: Birthday, budget: string): GiftSuggestion[] => {
    const age = birthday.birth_year ? new Date().getFullYear() - birthday.birth_year : 'unspecified';

    if (budget === 'Low') {
        return [
            {
                id: '1',
                title: 'Customized Memory Jar',
                description: 'A beautiful glass jar filled with 365 handwritten notes of shared memories.',
                why: `Since ${birthday.name} is your ${birthday.relationship}, this personal touch is priceless.`
            },
            {
                id: '2',
                title: 'Handmade Recipe Book',
                description: 'A curated collection of their favorite snacks or meals.',
                why: 'Thoughtful and budget-friendly for a close connection.'
            },
            {
                id: '3',
                title: 'Succulent Garden',
                description: 'A small, easy-to-care-for plant in a decorated pot.',
                why: 'A long-lasting reminder of your friendship.'
            }
        ];
    }

    if (budget === 'Medium') {
        return [
            {
                id: '1',
                title: 'Premium Coffee Subscription',
                description: 'A 3-month curated bean delivery from around the world.',
                why: 'Perfect for someone busy who appreciates a quality morning.'
            },
            {
                id: '2',
                title: 'Weighted Blanket',
                description: 'A 15lb sensory blanket for deep relaxation and sleep.',
                why: `${birthday.name} will appreciate the stress-relief after a long day.`
            },
            {
                id: '3',
                title: 'Portable Bluetooth Record Player',
                description: 'A retro-style suitcase turntable with modern speakers.',
                why: 'Combines nostalgia with utility for a great home vibe.'
            }
        ];
    }

    return [
        {
            id: '1',
            title: 'Noise-Canceling Headphones',
            description: 'The latest Sony or Bose flagship models.',
            why: 'The ultimate gift for focus and travel luxury.'
        },
        {
            id: '2',
            title: 'Smart Watch / Health Tracker',
            description: 'Latest generation Apple Watch or high-end Garmin.',
            why: `Great for ${birthday.name} to track their turning ${age} milestones.`
        },
        {
            id: '3',
            title: 'Weekend Spa Getaway',
            description: 'A voucher for a 2-night stay at a local boutique wellness retreat.',
            why: `As your ${birthday.relationship}, they deserve some serious pampering.`
        }
    ];
};
