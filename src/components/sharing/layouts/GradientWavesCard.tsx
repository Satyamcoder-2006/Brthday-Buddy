import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BirthdayInfo, CardState } from '../types';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

export const GradientWavesCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string[]> = {
        sunset: ['#FF9500', '#FF5E62', '#FF9966'],
        ocean: ['#2193b0', '#6dd5ed', '#2193b0'],
        forest: ['#11998e', '#38ef7d', '#11998e'],
        rose: ['#ff9966', '#ff5e62', '#ff9966'],
        midnight: ['#232526', '#414345', '#232526'],
        candy: ['#8E2DE2', '#4A00E0', '#8E2DE2'],
        lavender: ['#654ea3', '#eaafc8', '#654ea3'],
        cosmic: ['#000046', '#1CB5E0', '#000046'],
    };

    const colors = themeColors[theme] || themeColors.ocean;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={colors as [string, string, ...string[]]}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                {showPhoto && birthday.photoUrl && (
                    <View style={styles.photoFrame}>
                        <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                    </View>
                )}

                <Text style={styles.name}>{birthday.name.toUpperCase()}</Text>
                <View style={styles.divider} />
                <Text style={styles.age}>TURNING {birthday.age}</Text>

                {customMessage ? (
                    <View style={styles.customBox}>
                        <Text style={styles.message}>{customMessage}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: '85%',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    photoFrame: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        borderColor: '#FFF',
        marginBottom: 20,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        textAlign: 'center',
        letterSpacing: 1,
    },
    divider: {
        width: 40,
        height: 3,
        backgroundColor: '#FFF',
        marginVertical: 10,
    },
    age: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFF',
        letterSpacing: 2,
    },
    customBox: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        width: '100%',
    },
    message: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
