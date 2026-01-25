import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BirthdayInfo, CardState } from '../types';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

export const GlassmorphismCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string[]> = {
        sunset: ['#FF9966', '#FF5E62'],
        ocean: ['#2193b0', '#6dd5ed'],
        forest: ['#11998e', '#38ef7d'],
        rose: ['#8E2DE2', '#4A00E0'],
        midnight: ['#232526', '#414345'],
        candy: ['#DA4453', '#89216B'],
        lavender: ['#7F00FF', '#E100FF'],
        cosmic: ['#5f2c82', '#49a09d'],
    };

    const colors = (themeColors[theme] || themeColors.ocean) as any;

    return (
        <View style={styles.container}>
            {/* Dynamic Background */}
            <LinearGradient colors={colors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

            {/* Decorative Orbs */}
            <View style={[styles.orb, { top: -50, left: -50, backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={[styles.orb, { bottom: -80, right: -20, width: 200, height: 200, backgroundColor: 'rgba(255,255,255,0.15)' }]} />

            {/* Glass Card */}
            <View style={styles.content}>
                <View style={styles.glassContainer}>
                    <View style={styles.header}>
                        <Text style={styles.suptitle}>HAPPY BIRTHDAY</Text>
                    </View>

                    {showPhoto && birthday.photoUrl && (
                        <View style={styles.photoContainer}>
                            <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                        </View>
                    )}

                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>{birthday.name}</Text>
                        <Text style={styles.age}>{birthday.age}</Text>
                    </View>

                    {customMessage ? (
                        <View style={styles.msgContainer}>
                            <Text style={styles.message} numberOfLines={3}>{customMessage}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    glassContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    header: {
        marginBottom: 16,
    },
    suptitle: {
        fontSize: 14,
        letterSpacing: 4,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    photoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 58,
    },
    info: {
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    age: {
        fontSize: 64,
        fontWeight: '200',
        color: '#fff',
        lineHeight: 70,
    },
    msgContainer: {
        marginTop: 8,
        width: '100%',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
    },
    message: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 22,
    },
});
