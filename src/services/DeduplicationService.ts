import Fuse from 'fuse.js';

export interface BirthdayEntry {
    name: string;
    date: string; // YYYY-MM-DD
    notes?: string;
    [key: string]: any;
}

export interface MatchAttempt {
    extracted: BirthdayEntry;
    existing: BirthdayEntry;
    matchType: 'exact' | 'name_only';
    confidence: number;
}

export interface DedupResult {
    matches: MatchAttempt[];
    newEntries: BirthdayEntry[];
}

export class DeduplicationService {
    /**
     * Find duplicates between extracted entries and existing entries
     */
    findDuplicates(
        extractedEntries: BirthdayEntry[],
        existingEntries: BirthdayEntry[]
    ): DedupResult {
        const fuse = new Fuse(existingEntries, {
            keys: ['name'],
            threshold: 0.3, // 0.0 is perfect match, 1.0 is no match. 0.3 is strict but allows typos.
            includeScore: true
        });

        const matches: MatchAttempt[] = [];
        const newEntries: BirthdayEntry[] = [];

        for (const extracted of extractedEntries) {
            if (!extracted.name) {
                continue; // Skip invalid entries
            }

            const results = fuse.search(extracted.name);

            if (results.length > 0) {
                const topMatch = results[0];
                const existing = topMatch.item;

                // Simple date comparison (ignoring year if 1900)
                const isDateMatch = this.compareDates(extracted.date, existing.date);

                if (isDateMatch && topMatch.score! < 0.1) {
                    // Very high confidence (name almost exact + date match)
                    matches.push({
                        extracted,
                        existing,
                        matchType: 'exact',
                        confidence: 1 - (topMatch.score || 0)
                    });
                } else {
                    // Name matches but date is different or missing, OR name is somewhat similar
                    matches.push({
                        extracted,
                        existing,
                        matchType: 'name_only',
                        confidence: 1 - (topMatch.score || 0)
                    });
                }
            } else {
                newEntries.push(extracted);
            }
        }

        return { matches, newEntries };
    }

    private compareDates(date1: string, date2: string): boolean {
        if (!date1 || !date2) return false;
        // Compare MM-DD only
        const d1 = date1.substring(5);
        const d2 = date2.substring(5);
        return d1 === d2;
    }
}
