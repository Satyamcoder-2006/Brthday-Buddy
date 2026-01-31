import { supabase } from './supabase';

const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || '';
const MISTRAL_URL = 'https://api.mistral.ai/v1';

export interface GiftIdea {
    id: string;
    birthday_id: string;
    product_name: string;
    product_url?: string;
    price?: number;
    status: 'idea' | 'reserved' | 'bought';
    image_url?: string;
    notes?: string;
}

export class GiftRegistryService {
    /**
     * Parse a product URL to extract details using Mistral AI via Fetch.
     */
    async extractProductInfoFromUrl(url: string, pageContentSnippet?: string): Promise<Partial<GiftIdea>> {
        let titleGuess = '';
        let htmlSnippet = pageContentSnippet || '';

        try {
            const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const html = await response.text();

            const titleMatch = html.match(/<title>(.*?)<\/title>/);
            if (titleMatch) titleGuess = titleMatch[1];

            if (!htmlSnippet) {
                const metaTags = (html.match(/<meta.*?>/g) || []).slice(0, 10).join('\n');
                const bodyText = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, '').replace(/<[^>]*>?/gm, ' ').substring(0, 2000);
                htmlSnippet = `Meta:\n${metaTags}\n\nContent:\n${bodyText}`;
            }
        } catch (e) {
            console.log('Fetch failed, relying on URL and provided snippet');
        }

        try {
            const body = {
                model: 'mistral-small-latest',
                messages: [
                    {
                        role: 'user',
                        content: `Extract product information from this URL and content.
                        URL: ${url}
                        Page Title: ${titleGuess || 'Not available'}
                        Content Snippet: ${htmlSnippet}
                        
                        Rules:
                        1. Identify the product name from the Title or URL.
                        2. Find the PRICE. Look for symbols like $, ₹, €, £ followed by numbers. 
                        3. On Amazon, look for meta tags like "twitter:text:price" or "og:price:amount".
                        4. Output ONLY valid JSON. If price is unknown, use 0.00.
                        
                        Output valid JSON:
                        {
                            "product_name": "Product Name",
                            "price": 0.00,
                            "image_url": "optional image url"
                        }`
                    }
                ],
                response_format: { type: 'json_object' }
            };

            const response = await fetch(`${MISTRAL_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error(`Status ${response.status}`);

            const completion = await response.json();
            const text = completion.choices?.[0]?.message?.content;
            if (typeof text !== 'string') return {};

            const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
            const extracted = JSON.parse(cleanJson);

            if (extracted.product_name === "Product Name") extracted.product_name = undefined;

            return extracted;
        } catch (e) {
            console.error('Gift Extraction Error', e);
            return { product_name: undefined };
        }
    }

    async getGifts(birthdayId: string): Promise<GiftIdea[]> {
        const { data, error } = await supabase
            .from('gift_registry')
            .select('*')
            .eq('birthday_id', birthdayId);

        if (error) throw error;
        return data || [];
    }

    async addGift(gift: Omit<GiftIdea, 'id'>): Promise<GiftIdea> {
        const { data, error } = await supabase
            .from('gift_registry')
            .insert([gift])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateGiftStatus(id: string, status: GiftIdea['status']) {
        const { error } = await supabase
            .from('gift_registry')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    }

    async deleteGift(id: string) {
        const { error } = await supabase
            .from('gift_registry')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}
