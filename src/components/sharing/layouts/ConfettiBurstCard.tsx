import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';
import { BirthdayInfo, CardState } from '../types';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

const ConfettiPiece = ({ delay, color, x, type }: { delay: number, color: string, x: string, type: string }) => {
    const translateY = useRef(new Animated.Value(-50)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(translateY, {
                    toValue: 600,
                    duration: 2000 + Math.random() * 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ])
        ).start();

        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [delay, rotate, translateY]);

    const rotation = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <Animated.View style={{
            transform: [
                { translateY: translateY },
                { rotate: rotation }
            ],
            left: x as any,
            position: 'absolute',
            top: -50,
        }}>
            <Svg height="15" width="15">
                {type === 'circle' && <Circle cx="7.5" cy="7.5" r="6" fill={color} />}
                {type === 'rect' && <Rect x="3.5" y="3.5" width="8" height="8" fill={color} />}
                {type === 'triangle' && <Polygon points="7.5,0 15,15 0,15" fill={color} />}
            </Svg>
        </Animated.View>
    );
};

export const ConfettiBurstCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string[]> = {
        sunset: ['#FF9500', '#FF2D55', '#FFCC00'],
        ocean: ['#00C7BE', '#007AFF', '#5AC8FA'],
        forest: ['#4CD964', '#34AADC', '#FFCC00'],
        rose: ['#FF2D55', '#FF9500', '#AF52DE'],
        midnight: ['#000', '#333', '#666'],
        candy: ['#FF2D55', '#5856D6', '#FFCC00'],
        lavender: ['#AF52DE', '#5856D6', '#FF9500'],
        cosmic: ['#5856D6', '#007AFF', '#5AC8FA'],
    };

    const colors = themeColors[theme] || themeColors.candy;
    const confettiCount = 15;

    return (
        <View style={styles.container}>
            <View style={styles.bg} />
            {Array.from({ length: confettiCount }).map((_, i) => (
                <ConfettiPiece
                    key={i}
                    delay={Math.random() * 2000}
                    color={colors[i % colors.length]}
                    x={`${Math.random() * 100}%`}
                    type={['circle', 'rect', 'triangle'][i % 3]}
                />
            ))}

            <View style={styles.content}>
                <View style={styles.banner}>
                    <Text style={styles.bannerText}>IT'S YOUR DAY!</Text>
                </View>

                {showPhoto && birthday.photoUrl && (
                    <View style={[styles.photoFrame, { borderColor: colors[0] }]}>
                        <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                    </View>
                )}

                <Text style={[styles.name, { color: colors[1] }]}>
                    {birthday.name.toUpperCase()}
                </Text>

                <View style={[styles.ageTag, { backgroundColor: colors[0] }]}>
                    <Text style={styles.ageText}>TURNING {birthday.age}</Text>
                </View>

                {customMessage ? (
                    <Text style={[styles.message, { color: colors[2] }]}>{customMessage}</Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8F0',
        overflow: 'hidden',
    },
    bg: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    banner: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 8,
        transform: [{ rotate: '-5deg' }],
        marginBottom: 20,
        borderRadius: 5,
        elevation: 5,
    },
    bannerText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    photoFrame: {
        width: 140,
        height: 140,
        borderRadius: 15,
        borderWidth: 5,
        marginBottom: 20,
        transform: [{ rotate: '5deg' }],
        backgroundColor: '#FFF',
        elevation: 10,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 5,
    },
    ageTag: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 10,
    },
    ageText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
});
