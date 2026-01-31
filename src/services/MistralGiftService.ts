/**
 * Mistral AI Gift Suggestion Service
 * 
 * Alternative AI provider for personalized gift recommendations
 */

import { GiftSuggestion } from './ai';
import { Birthday } from '../types';

const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || '';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL = 'mistral-medium';

interface MistralMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface MistralResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

/**
 * Call Mistral AI API with retry logic
 */
async function callMistralAPI(messages: MistralMessage[], temperature: number = 0.7): Promise<string> {
    if (!MISTRAL_API_KEY) {
        throw new Error('Mistral API key not configured');
    }

    const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages,
            temperature,
            max_tokens: 1000,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error (${response.status}): ${errorText}`);
    }

    const data: MistralResponse = await response.json();
    return data.choices[0]?.message?.content || '';
}

/**
 * Parse AI response into structured gift suggestions
 */
function parseGiftSuggestions(responseText: string): GiftSuggestion[] {
    try {
        // Try to find JSON in the response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.map((item: any, index: number) => ({
                id: `mistral-${index + 1}`,
                title: item.title || item.name || 'Gift Idea',
                description: item.description || '',
                why: item.why || item.reason || '',
            }));
        }

        // Fallback: parse line-by-line
        const gifts: GiftSuggestion[] = [];
        const lines = responseText.split('\n').filter(line => line.trim());

        let currentGift: Partial<GiftSuggestion> = {};
        lines.forEach((line, index) => {
            if (line.match(/^\d+\./)) {
                if (currentGift.title) {
                    gifts.push({
                        id: `mistral-${gifts.length + 1}`,
                        title: currentGift.title,
                        description: currentGift.description || '',
                        why: currentGift.why || '',
                    });
                }
                currentGift = { title: line.replace(/^\d+\.\s*/, '').trim() };
            } else if (line.toLowerCase().startsWith('description:')) {
                currentGift.description = line.substring(12).trim();
            } else if (line.toLowerCase().startsWith('why:')) {
                currentGift.why = line.substring(4).trim();
            }
        });

        if (currentGift.title) {
            gifts.push({
                id: `mistral-${gifts.length + 1}`,
                title: currentGift.title,
                description: currentGift.description || '',
                why: currentGift.why || '',
            });
        }

        return gifts.slice(0, 3);
    } catch (error) {
        console.error('Failed to parse Mistral response:', error);
        return [];
    }
}

/**
 * Generate personalized gift suggestions using Mistral AI
 */
export async function getMistralGiftSuggestions(birthday: Birthday): Promise<GiftSuggestion[]> {
    try {
        const age = birthday.birth_year
            ? new Date().getFullYear() - birthday.birth_year
            : null;

        const ageInfo = age ? `They are turning ${age} years old.` : '';
        const notesInfo = birthday.notes ? `Additional context: ${birthday.notes}` : '';

        const systemPrompt = `You are a thoughtful gift recommendation expert. Generate 3 personalized gift suggestions in valid JSON format.

Each suggestion must have:
- title: A specific gift name (not generic)
- description: Brief description of the gift
- why: Why this gift suits the person

Return ONLY a JSON array, no other text.`;

        const userPrompt = `Suggest 3 thoughtful gifts for ${birthday.name}, my ${birthday.relationship}.
${ageInfo}
${notesInfo}

Return as JSON array with format:
[{"title": "...", "description": "...", "why": "..."}]`;

        const messages: MistralMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];

        const responseText = await callMistralAPI(messages, 0.8);
        const suggestions = parseGiftSuggestions(responseText);

        if (suggestions.length === 0) {
            throw new Error('No valid suggestions parsed from response');
        }

        console.log(`✓ Generated ${suggestions.length} gift suggestions via Mistral`);
        return suggestions;

    } catch (error: any) {
        console.error('Mistral gift suggestions failed:', error.message);
        throw error;
    }
}

/**
 * Check if Mistral AI is available
 */
export function isMistralAvailable(): boolean {
    return Boolean(MISTRAL_API_KEY);
}
