import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../theme';

interface AvatarProps {
    uri?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 'md' }) => {
    const sizeMap = {
        sm: 32,
        md: 48,
        lg: 64,
        xl: 120,
    };

    const width = sizeMap[size];
    const textSize = width / 2.5;

    const initials = name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <View style={[styles.container, { width, height: width }]}>
            {uri ? (
                <Image
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <Text style={[styles.initials, { fontSize: textSize }]}>
                    {initials}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.border,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    initials: {
        fontWeight: 'bold',
        color: colors.primary,
    },
});
