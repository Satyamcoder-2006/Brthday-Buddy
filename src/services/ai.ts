import { Birthday } from '../types';

export interface GiftSuggestion {
    id: string;
    title: string;
    description: string;
    why: string;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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
        console.error('Gemini API Error:', error);
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

        const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 512,  // Increased for 6 messages with emojis
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) throw new Error('API Error');
        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;

        // Extract JSON from markdown code blocks or plain text
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\[[\s\S]*\]/);
        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

        return JSON.parse(jsonText.trim());
    } catch (error) {
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
           - "description" (1-2 sentences about the gift)
           - "why" (Short reasoning why this fits their profile)
        
        CRITICAL: Return ONLY the raw JSON array. DO NOT include markdown formatting or extra text.
    `;

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 2048,  // Increased for detailed gift descriptions
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    try {
        // Extract JSON from markdown code blocks or plain text
        // Use [\s\S]*? for non-greedy matching to handle multiline JSON
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\[[\s\S]*\]/);
        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

        const parsed = JSON.parse(jsonText.trim());
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
