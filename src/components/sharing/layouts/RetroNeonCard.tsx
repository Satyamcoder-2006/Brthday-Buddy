import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BirthdayInfo, CardState } from '../types';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

export const RetroNeonCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;
    const glowOpacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowOpacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 0.6,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [glowOpacity]);

    const themeColors: Record<string, { primary: string, secondary: string }> = {
        sunset: { primary: '#FF00CC', secondary: '#333399' },
        ocean: { primary: '#00FFFF', secondary: '#0000FF' },
        forest: { primary: '#00FF00', secondary: '#006600' },
        rose: { primary: '#FF0066', secondary: '#660033' },
        midnight: { primary: '#FFFFFF', secondary: '#333333' },
        candy: { primary: '#FF66FF', secondary: '#6600CC' },
        lavender: { primary: '#CC99FF', secondary: '#663399' },
        cosmic: { primary: '#00FFFF', secondary: '#FF00FF' },
    };

    const colors = themeColors[theme] || themeColors.cosmic;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#120428', '#2a0845']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.gridContainer}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <View key={`h-${i}`} style={[styles.gridLineH, { top: i * 35 }]} />
                ))}
            </View>

            <View style={styles.content}>
                <Animated.Text style={[
                    styles.headerText,
                    { opacity: glowOpacity },
                    {
                        color: colors.primary,
                        textShadowColor: colors.primary,
                        textShadowRadius: 8
                    }
                ]}>
                    HAPPY BIRTHDAY
                </Animated.Text>

                {showPhoto && birthday.photoUrl && (
                    <Animated.View style={[
                        styles.photoFrame,
                        { opacity: glowOpacity },
                        { borderColor: colors.primary, shadowColor: colors.primary }
                    ]}>
                        <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                    </Animated.View>
                )}

                <Animated.Text style={[
                    styles.name,
                    { opacity: glowOpacity },
                    {
                        color: '#FFF',
                        textShadowColor: colors.primary,
                        textShadowRadius: 12
                    }
                ]}>
                    {birthday.name.toUpperCase()}
                </Animated.Text>

                <View style={[styles.ageBox, { borderColor: colors.primary }]}>
                    <Text style={[styles.ageText, { color: colors.primary }]}>
                        Lvl {birthday.age}
                    </Text>
                </View>

                {customMessage ? (
                    <Text style={[styles.message, { color: colors.primary }]}>
                        {customMessage}
                    </Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.2,
    },
    gridLineH: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: '#FF00FF',
    },
    content: {
        alignItems: 'center',
        padding: 15,
        zIndex: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    photoFrame: {
        width: 140,
        height: 140,
        borderRadius: 10,
        borderWidth: 3,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
        elevation: 10,
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 36,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 15,
    },
    ageBox: {
        borderWidth: 2,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    ageText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
});
