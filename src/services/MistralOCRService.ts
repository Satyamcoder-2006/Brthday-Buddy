import * as FileSystem from 'expo-file-system';

const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || '';
const MISTRAL_URL = 'https://api.mistral.ai/v1';

if (!MISTRAL_API_KEY) {
    console.warn('⚠️ EXPO_PUBLIC_MISTRAL_API_KEY is missing. Mistral features will not work.');
}

export interface ExtractedBirthday {
    name: string;
    date: string; // YYYY-MM-DD
    notes?: string;
    confidence?: string; // 'high', 'medium', 'low'
    relationship?: string;
}

export class MistralOCRService {
    /**
     * Helper for calling Mistral API directly via Fetch
     */
    private async callMistral(endpoint: string, body: any) {
        try {
            const response = await fetch(`${MISTRAL_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `API Error ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error(`Mistral API Error (${endpoint}):`, error.message);
            throw error;
        }
    }

    /**
     * Extract birthdays from PDF documents using Mistral OCR 3
     */
    async extractFromPDF(base64Pdf: string): Promise<ExtractedBirthday[]> {
        try {
            console.log('Sending PDF to Mistral OCR...');
            const ocrResponse = await this.callMistral('ocr', {
                model: 'mistral-ocr-latest',
                document: {
                    type: 'document_base64',
                    document_base64: base64Pdf,
                    media_type: 'application/pdf'
                }
            });

            // Extract text from all pages
            const fullText = ocrResponse.pages
                .map((page: any) => page.markdown)
                .join('\n\n');

            return await this.parseBirthdaysFromText(fullText);
        } catch (error: any) {
            throw new Error(`Mistral PDF Error: ${error.message}`);
        }
    }

    /**
     * Extract birthdays from images using Pixtral Vision
     */
    async extractFromImage(base64Image: string, mimeType: string = 'image/jpeg'): Promise<ExtractedBirthday[]> {
        try {
            console.log('Sending Image to Mistral Vision...');
            const completion = await this.callMistral('chat/completions', {
                model: 'pixtral-12b-2409',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Extract all person names and birth dates from this image.
                                
Rules:
- Extract complete names
- Standardize all dates to YYYY-MM-DD (Use 0000 if year is missing)
- Detect relationships (friend, family, colleague)
- Ignore unrelated text

Output ONLY a JSON object with a 'birthdays' property containing a valid JSON array:
{"birthdays": [{"name": "...", "date": "YYYY-MM-DD", "relationship": "...", "notes": "..."}]}`
                            },
                            {
                                type: 'image_url',
                                image_url: `data:${mimeType};base64,${base64Image}`
                            }
                        ]
                    }
                ],
                response_format: { type: 'json_object' }
            });

            const responseText = completion.choices?.[0]?.message?.content;
            return this.parseJSONContent(responseText || '');
        } catch (error: any) {
            throw new Error(`Mistral Image Error: ${error.message}`);
        }
    }

    /**
     * Extract from CSV text
     */
    async extractFromCSV(csvText: string): Promise<ExtractedBirthday[]> {
        return await this.parseBirthdaysFromText(`CSV Data:\n${csvText}`);
    }

    /**
     * Use Mistral LLM to parse text into structured data
     */
    private async parseBirthdaysFromText(text: string): Promise<ExtractedBirthday[]> {
        try {
            const completion = await this.callMistral('chat/completions', {
                model: 'mistral-small-latest',
                messages: [
                    {
                        role: 'user',
                        content: `Extract all person names and birth dates from this text:

${text}

Rules:
- Parse dates in ANY format (MM/DD/YYYY, DD/MM/YYYY, Month DD YYYY)
- Standardize to YYYY-MM-DD. If year is missing strictly use 0000-MM-DD.
- Detect relationships if mentioned (mom, colleague, friend)
- Ignore unrelated text

Output ONLY a JSON object with a 'birthdays' property containing a valid JSON array:
{
  "birthdays": [
    {
      "name": "John Smith",
      "date": "1990-05-15",
      "relationship": "friend",
      "notes": "..."
    }
  ]
}`
                    }
                ],
                response_format: { type: 'json_object' }
            });

            const responseText = completion.choices?.[0]?.message?.content || '{}';
            const data = JSON.parse(responseText);
            return data.birthdays || [];
        } catch (error: any) {
            console.error('Mistral Parsing Error:', error.message);
            return [];
        }
    }

    private parseJSONContent(text: string): ExtractedBirthday[] {
        try {
            const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
            const data = JSON.parse(cleanJson);
            if (data.birthdays) return data.birthdays;
            if (Array.isArray(data)) return data;
            return [];
        } catch (e) {
            console.error('Failed to parse Mistral JSON:', text);
            return [];
        }
    }
}
