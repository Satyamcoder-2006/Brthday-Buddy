import AsyncStorage from '@react-native-async-storage/async-storage';

export const parseBoolean = (value: string | boolean | null | undefined): boolean => {
    if (typeof value === 'boolean') return value;
    if (value === null || value === undefined) return false;
    return value === 'true' || value === '1' || value === 'yes';
};

export const safeGetBoolean = async (key: string, defaultValue = false): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value === null) return defaultValue;
        return parseBoolean(value);
    } catch {
        return defaultValue;
    }
};
