import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BirthdayInfo, CardState } from '../types';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

const Flower = ({ color, style }: { color: string, style: any }) => (
    <View style={[styles.flower, style]}>
        <Svg height="40" width="40" viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="15" fill="#FFD700" />
            {Array.from({ length: 8 }).map((_, i) => (
                <Path
                    key={i}
                    d="M50 35 Q60 0 70 35"
                    fill={color}
                    transform={`rotate(${i * 45}, 50, 50)`}
                />
            ))}
        </Svg>
    </View>
);

export const FloralDreamCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string[]> = {
        sunset: ['#FF9500', '#FF3B30', '#FFF'],
        ocean: ['#007AFF', '#5AC8FA', '#F2F2F7'],
        forest: ['#4CD964', '#34AADC', '#FFF'],
        rose: ['#FF2D55', '#FF9500', '#FFF'],
        midnight: ['#555', '#888', '#000'],
        candy: ['#AF52DE', '#FF2D55', '#FFF'],
        lavender: ['#5856D6', '#AF52DE', '#FFF'],
        cosmic: ['#5AC8FA', '#5856D6', '#FFF'],
    };

    const colors = themeColors[theme] || themeColors.rose;

    return (
        <View style={[styles.container, { backgroundColor: colors[2] === '#000' ? '#1A1A1A' : '#FFF9FB' }]}>
            <Flower color={colors[0]} style={{ top: 20, left: 20 }} />
            <Flower color={colors[1]} style={{ top: 50, right: 10 }} />
            <Flower color={colors[0]} style={{ bottom: 40, left: 10 }} />
            <Flower color={colors[1]} style={{ bottom: 20, right: 30 }} />

            <View style={styles.content}>
                <Text style={[styles.title, { color: colors[0] }]}>Wishing you a beautiful day</Text>

                {showPhoto && birthday.photoUrl && (
                    <View style={[styles.photoFrame, { borderColor: colors[0] }]}>
                        <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                    </View>
                )}

                <Text style={[styles.name, { color: colors[1] }]}>{birthday.name}</Text>
                <Text style={styles.age}>Happiness on your {birthday.age}th</Text>

                {customMessage ? (
                    <Text style={styles.message}>{customMessage}</Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    flower: {
        position: 'absolute',
        opacity: 0.6,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontStyle: 'italic',
        marginBottom: 20,
        textAlign: 'center',
    },
    photoFrame: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1,
        padding: 6,
        marginBottom: 20,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
    },
    name: {
        fontSize: 32,
        fontWeight: '300',
        textAlign: 'center',
    },
    age: {
        fontSize: 16,
        color: '#888',
        marginTop: 5,
        letterSpacing: 1,
    },
    message: {
        fontSize: 14,
        color: '#666',
        marginTop: 20,
        textAlign: 'center',
        maxWidth: '85%',
        lineHeight: 20,
    },
});
