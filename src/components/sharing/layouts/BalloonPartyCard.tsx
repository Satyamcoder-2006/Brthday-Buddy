import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BirthdayInfo, CardState } from '../types';
import Svg, { Path } from 'react-native-svg';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

const Balloon = ({ color, delay, x }: { color: string, delay: number, x: number }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(translateY, {
                    toValue: -15,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(translateX, {
                    toValue: 8,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(translateX, {
                    toValue: -8,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [delay, translateX, translateY]);

    return (
        <Animated.View style={[
            styles.balloonContainer,
            {
                left: x,
                transform: [
                    { translateY: translateY },
                    { translateX: translateX }
                ]
            }
        ]}>
            <Svg width="40" height="55" viewBox="0 0 60 80">
                <Path d="M30 0 C13.4 0 0 16 0 35 C0 54 13.4 70 30 70 C46.6 70 60 54 60 35 C60 16 46.6 0 30 0 Z" fill={color} />
                <Path d="M30 70 L30 80" stroke="#999" strokeWidth="2" />
            </Svg>
        </Animated.View>
    );
};

export const BalloonPartyCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string[]> = {
        sunset: ['#FF9500', '#FFCC00', '#FF3B30'],
        ocean: ['#5AC8FA', '#007AFF', '#4CD964'],
        forest: ['#4CD964', '#FFCC00', '#007AFF'],
        rose: ['#FF2D55', '#FFD1DC', '#FF9500'],
        midnight: ['#555', '#888', '#333'],
        candy: ['#AF52DE', '#FF2D55', '#5856D6'],
        lavender: ['#5856D6', '#AF52DE', '#888'],
        cosmic: ['#5856D6', '#007AFF', '#FF2D55'],
    };

    const colors = themeColors[theme] || themeColors.ocean;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#E0F7FA', '#B2EBF2']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.balloonsArea}>
                <Balloon color={colors[0]} delay={0} x={15} />
                <Balloon color={colors[1]} delay={500} x={75} />
                <Balloon color={colors[2]} delay={1000} x={135} />
                <Balloon color={colors[0]} delay={200} x={195} />
            </View>

            <View style={styles.content}>
                <View style={styles.titleBox}>
                    <Text style={[styles.title, { color: colors[1] }]}>CELEBRATE!</Text>
                </View>

                {showPhoto && birthday.photoUrl && (
                    <View style={styles.photoFrame}>
                        <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                    </View>
                )}

                <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit>{birthday.name.toUpperCase()}</Text>
                <Text style={[styles.age, { color: colors[2] }]}>{birthday.age}</Text>

                {customMessage ? (
                    <View style={styles.msgBubble}>
                        <Text style={styles.message} numberOfLines={3} adjustsFontSizeToFit>{customMessage}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    balloonsArea: {
        height: 150,
        position: 'absolute',
        top: 30,
        width: '100%',
    },
    balloonContainer: {
        position: 'absolute',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 80, // Reduced from 100
        paddingHorizontal: 20,
    },
    titleBox: {
        marginBottom: 15,
        backgroundColor: '#FFF',
        padding: 6,
        borderRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    photoFrame: {
        width: 120, // Reduced from 140
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#FFF',
        marginBottom: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
        textAlign: 'center',
    },
    age: {
        fontSize: 50, // Reduced from 60
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    msgBubble: {
        backgroundColor: '#FFF',
        padding: 8,
        borderRadius: 12,
        borderBottomLeftRadius: 0,
        marginTop: 5,
        elevation: 2,
        maxWidth: '90%',
    },
    message: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
        textAlign: 'center',
    },
});
