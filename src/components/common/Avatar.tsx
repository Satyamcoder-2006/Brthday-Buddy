import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, gradients } from '../../theme';

interface AvatarProps {
    uri?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 'md' }) => {
    const sizeMap = {
        sm: 32,
        md: 48,
        lg: 64,
        xl: 96,
        xxl: 120,
    };

    const width = sizeMap[size];
    const textSize = width / 2.5;

    const initials = name
        .split(' ')
        .filter(Boolean)
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
                <LinearGradient
                    colors={gradients.surface as any}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.initialsContainer}>
                        <Text style={[styles.initials, { fontSize: textSize }]}>
                            {initials}
                        </Text>
                    </View>
                </LinearGradient>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: colors.borderLight,
        backgroundColor: colors.surface,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    initialsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 1,
    },
});
