import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export interface DocumentPickResult {
    uri: string;
    mimeType: string;
    name: string;
    type: 'success';
}

export class DocumentImportService {
    /**
     * Pick a document (PDF, CSV, TXT)
     */
    async pickDocument(): Promise<DocumentPickResult> {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'text/csv', 'text/comma-separated-values', 'text/plain'],
            copyToCacheDirectory: true,
            multiple: false
        });

        if (result.canceled) {
            throw new Error('Document selection cancelled');
        }

        const asset = result.assets[0];
        return {
            uri: asset.uri,
            mimeType: asset.mimeType || 'application/octet-stream',
            name: asset.name,
            type: 'success'
        };
    }

    /**
     * Pick an image from the library
     */
    async pickImage(): Promise<ImagePicker.ImagePickerAsset> {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: false,
            quality: 1, // High quality for OCR
            base64: true, // Need base64 for Gemini
        });

        if (!result.canceled) {
            return result.assets[0];
        }
        throw new Error('Image selection cancelled');
    }

    /**
     * Read a file as a Base64 string
     */
    async readFileAsBase64(uri: string): Promise<string> {
        return await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64'
        });
    }

    /**
     * Read a file as text (for CSV/TXT)
     */
    async readFileAsText(uri: string): Promise<string> {
        return await FileSystem.readAsStringAsync(uri, {
            encoding: 'utf8'
        });
    }
}
