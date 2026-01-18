import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BirthdayInfo, CardState } from '../types';
import Svg, { Path } from 'react-native-svg';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

const Star = ({ delay, size, x, y }: { delay: number, size: number, x: string, y: string }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: 10,
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
            Animated.timing(rotate, {
                toValue: 1,
                duration: 5000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [delay]);

    const rotation = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <Animated.View style={[
            { position: 'absolute', left: x as any, top: y as any },
            {
                opacity: opacity,
                transform: [
                    { translateY: translateY },
                    { rotate: rotation }
                ]
            }
        ]}>
            <View style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: '#FFF',
            }} />
        </Animated.View>
    );
};

export const StarryNightCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string[]> = {
        sunset: ['#2c3e50', '#fd746c'],
        ocean: ['#0f0c29', '#302b63', '#24243e'],
        forest: ['#000000', '#0f9b0f'],
        rose: ['#232526', '#414345'],
        midnight: ['#000000', '#0f0c29'],
        candy: ['#4b134f', '#c94b4b'],
        lavender: ['#2C3E50', '#4CA1AF'],
        cosmic: ['#000000', '#434343'],
    };

    const colors = themeColors[theme] || themeColors.ocean;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={colors as [string, string, ...string[]]}
                style={StyleSheet.absoluteFill}
            />

            {Array.from({ length: 20 }).map((_, i) => (
                <Star
                    key={i}
                    delay={Math.random() * 2000}
                    size={Math.random() * 3 + 1}
                    x={`${Math.random() * 100}%`}
                    y={`${Math.random() * 100}%`}
                />
            ))}

            <View style={styles.moon}>
                <Svg width="50" height="50" viewBox="0 0 100 100">
                    <Path d="M40 10 A30 30 0 1 0 40 90 A45 45 0 1 1 40 10 Z" fill="#FDFD96" />
                </Svg>
            </View>

            <View style={styles.content}>
                <Text style={styles.headerText}>Make a wish...</Text>

                {showPhoto && birthday.photoUrl && (
                    <View style={styles.photoFrame}>
                        <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                    </View>
                )}

                <Text style={styles.name}>{birthday.name}</Text>
                <View style={styles.line} />

                {customMessage ? (
                    <Text style={styles.message}>{customMessage}</Text>
                ) : (
                    <Text style={styles.message}>May your year be magical ✨</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moon: {
        position: 'absolute',
        top: 30,
        right: 30,
    },
    content: {
        alignItems: 'center',
        padding: 20,
        zIndex: 10,
    },
    headerText: {
        fontSize: 18,
        color: '#FDFD96',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    photoFrame: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 20,
        padding: 4,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    line: {
        width: 60,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginVertical: 15,
    },
    message: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontStyle: 'italic',
        maxWidth: '90%',
    },
});
