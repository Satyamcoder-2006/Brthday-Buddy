import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Birthday } from '../types';

export const DataExportService = {
    /**
     * Generate and share a CSV file of all birthdays
     */
    async exportToCSV(birthdays: Birthday[]): Promise<void> {
        try {
            console.log('📂 Starting CSV export for', birthdays.length, 'contacts');

            // 1. Generate CSV Content
            const header = 'Name,Birthday,Age,Relationship,Notes\n';

            const rows = birthdays.map(b => {
                const escape = (str: string | undefined | null) => {
                    if (!str) return '';
                    // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                const calculateAge = (dateStr: string) => {
                    const birthDate = new Date(dateStr);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    return Math.max(0, age).toString();
                };

                return [
                    escape(b.name),
                    b.birthday_date, // Assumes YYYY-MM-DD format which is CSV friendly
                    calculateAge(b.birthday_date),
                    escape(b.relationship),
                    escape(b.notes)
                ].join(',');
            }).join('\n');

            const csvContent = header + rows;

            // 2. Write to temporary file
            const filename = `birthdays_export_${new Date().toISOString().split('T')[0]}.csv`;
            const fileUri = `${FileSystem.cacheDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: 'utf8'
            });

            // 3. Share the file
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Birthday Data',
                    UTI: 'public.comma-separated-values-text' // helpful for iOS
                });
            } else {
                throw new Error('Sharing is not available on this device');
            }

        } catch (error: any) {
            console.error('❌ CSV Export Failed:', error);
            throw new Error(error.message || 'Failed to export data');
        }
    }
};
