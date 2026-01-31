import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with API Key from environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('⚠️ EXPO_PUBLIC_GEMINI_API_KEY is missing. AI features will not work.');
}

export interface ExtractedBirthday {
    name: string;
    date: string; // YYYY-MM-DD
    notes?: string;
    confidence?: string; // 'high', 'medium', 'low'
    relationship?: string;
}

export class GeminiExtractorService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(API_KEY);
    }

    /**
     * Extract birthdays from a PDF file (provided as Base64 string)
     */
    async extractFromPDF(base64Data: string): Promise<ExtractedBirthday[]> {
        // Using supported model from list
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Extract all person names and birth dates from this document.
    
Rules:
- Extract complete names (first name + last name if available)
- Parse dates in ANY format (MM/DD/YYYY, DD/MM/YYYY, Month DD YYYY, etc.)
- Standardize to ISO format YYYY-MM-DD
- Ignore unrelated text
- If year is missing, us 0000 as placeholder
- Detect relationships if mentioned (colleague, friend, etc.)
- Look for columns like "DOB", "Birthday", "Date of Birth"

Output ONLY valid JSON array with this structure:
[
  {
    "name": "John Smith",
    "date": "1990-05-15",
    "notes": "colleague from marketing",
    "confidence": "high",
    "relationship": "colleague"
  }
]`;

        try {
            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: base64Data
                    }
                },
                prompt
            ]);

            const responseText = result.response.text();
            console.log('Gemini PDF Raw Response:', responseText);
            return this.parseJSON(responseText);
        } catch (error: any) {
            console.error('Gemini PDF Extraction Error:', error.message, error);
            throw new Error(`Failed to extract data: ${error.message}`);
        }
    }

    /**
     * Extract birthdays from an Image (OCR)
     */
    async extractFromImage(base64Data: string, mimeType: string = 'image/jpeg'): Promise<ExtractedBirthday[]> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `This image contains a list of people and their birthdays.
    
Extract ALL visible names and dates. Handle:
- Handwritten text
- Tables/spreadsheets
- Screenshots of contacts
- Group chat messages
- Calendar views

Output ONLY valid JSON array with the same structure as above.`;

        try {
            console.log('Sending image to Gemini...', mimeType, base64Data.substring(0, 50) + '...');
            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                prompt
            ]);

            const responseText = result.response.text();
            console.log('Gemini Image Raw Response:', responseText);
            return this.parseJSON(responseText);
        } catch (error: any) {
            console.error('Gemini Image Extraction Error:', error.message, error);
            throw new Error(`Failed to extract data from Image: ${error.message}`);
        }
    }

    /**
     * Extract birthdays from CSV text
     */
    async extractFromCSV(csvText: string): Promise<ExtractedBirthday[]> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Parse this CSV data to extract birthdays.
    
The CSV might have different column names (Name, DOB, Birthday, Date of Birth, etc.).
Auto-detect columns and extract data. Dates must be YYYY-MM-DD.

CSV Content:
${csvText}

Output ONLY valid JSON array.`;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            console.log('Gemini CSV Raw Response:', responseText);
            return this.parseJSON(responseText);
        } catch (error: any) {
            console.error('Gemini CSV Extraction Error:', error.message, error);
            throw new Error(`Failed to extract data from CSV: ${error.message}`);
        }
    }

    private parseJSON(text: string): ExtractedBirthday[] {
        try {
            // Remove markdown code fences if present
            const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
            const data = JSON.parse(cleanJson);

            // Normalize dates
            return data.map((item: any) => ({
                ...item,
                date: this.normalizeDate(item.date)
            })).filter((item: ExtractedBirthday) => item.date && item.name);

        } catch (e) {
            console.error('Failed to parse Gemini response as JSON:', text);
            return [];
        }
    }

    private normalizeDate(dateStr: string): string {
        if (!dateStr) return '';

        console.log(`Normalizing date: "${dateStr}"`);

        // 1. ISO Format Check
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

        // 2. Cleanup
        // Remove ordinals (st, nd, rd, th), commas, and extra spaces
        let clean = dateStr
            .replace(/(\d+)(st|nd|rd|th)/ig, '$1')
            .replace(/,/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        console.log(`Cleaned: "${clean}"`);

        // 3. Try standard Date constructor first (converts "June 20, 2026" etc)
        let date = new Date(clean);
        // If yearless "20 June", try appending current year
        if (date.toString() === 'Invalid Date' || isNaN(date.getTime())) {
            const currentYear = new Date().getFullYear();
            date = new Date(`${clean} ${currentYear}`);
        }

        if (date.toString() !== 'Invalid Date' && !isNaN(date.getTime())) {
            return this.formatDateObject(date, clean);
        }

        // 4. Manual Regex Parsing (Fallback for engines like Hermes that might be strict)
        const months: { [key: string]: string } = {
            jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
            jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
            january: '01', february: '02', march: '03', april: '04', june: '06',
            july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
        };

        // Match: "20 June" or "20 June 1990"
        const dayMonthRegex = /^(\d{1,2})\s+([a-zA-Z]+)(?:\s+(\d{4}))?$/i;
        // Match: "June 20" or "June 20 1990"
        const monthDayRegex = /^([a-zA-Z]+)\s+(\d{1,2})(?:\s+(\d{4}))?$/i;

        let match = clean.match(dayMonthRegex);
        if (match) {
            const day = match[1].padStart(2, '0');
            const monthStr = match[2].toLowerCase().substring(0, 3);
            const year = match[3] || '0000';

            const monthKey = Object.keys(months).find(k => k.startsWith(monthStr));
            if (monthKey) {
                const result = `${year}-${months[monthKey]}-${day}`;
                console.log(`Manual Regex Parsed (DM): ${result}`);
                return result;
            }
        }

        match = clean.match(monthDayRegex);
        if (match) {
            const monthStr = match[1].toLowerCase().substring(0, 3);
            const day = match[2].padStart(2, '0');
            const year = match[3] || '0000';

            const monthKey = Object.keys(months).find(k => k.startsWith(monthStr));
            if (monthKey) {
                const result = `${year}-${months[monthKey]}-${day}`;
                console.log(`Manual Regex Parsed (MD): ${result}`);
                return result;
            }
        }

        console.warn(`Date parsing finally failed for: "${dateStr}"`);
        return '';
    }

    private formatDateObject(date: Date, originalStr: string): string {
        let year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        // Heuristic: If original string didn't have 4 digits, default to 0000
        if (!/\d{4}/.test(originalStr)) {
            return `0000-${month}-${day}`;
        }

        const res = `${year}-${month}-${day}`;
        console.log(`Date Obj Parsed: ${res}`);
        return res;
    }
}
