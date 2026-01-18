import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BirthdayInfo, CardState } from '../types';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

export const MinimalEleganceCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string> = {
        sunset: '#FF9500',
        ocean: '#00C7BE',
        forest: '#30B0C7',
        rose: '#FF2D55',
        midnight: '#FFFFFF',
        candy: '#AF52DE',
        lavender: '#5856D6',
        cosmic: '#5AC8FA',
    };

    const accentColor = themeColors[theme] || themeColors.midnight;

    return (
        <View style={styles.container}>
            <View style={[styles.borderFrame, { borderColor: accentColor }]} />
            <View style={styles.content}>
                {showPhoto && birthday.photoUrl ? (
                    <View style={[styles.photoFrame, { borderColor: accentColor }]}>
                        <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                    </View>
                ) : (
                    <View style={[styles.photoFrame, { borderColor: accentColor, backgroundColor: '#1A1A1A' }]}>
                        <Ionicons name="gift-outline" size={50} color={accentColor} />
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Text style={[styles.label, { color: accentColor }]}>CELEBRATING</Text>
                    <Text style={styles.age}>
                        {birthday.age}
                        <Text style={styles.yearsOld}> YEARS</Text>
                    </Text>
                    <Text style={[styles.name, { color: '#FFF' }]}>{birthday.name.toUpperCase()}</Text>

                    {customMessage ? (
                        <Text style={[styles.message, { color: '#CCC' }]}>{customMessage}</Text>
                    ) : null}
                </View>

                <Ionicons name="sparkles" size={20} color={accentColor} style={styles.sparkleTop} />
                <Ionicons name="sparkles" size={20} color={accentColor} style={styles.sparkleBottom} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    borderFrame: {
        position: 'absolute',
        top: 15,
        left: 15,
        right: 15,
        bottom: 15,
        borderWidth: 1,
        opacity: 0.5,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    photoFrame: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        overflow: 'hidden',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        letterSpacing: 3,
        marginBottom: 5,
        fontWeight: '300',
    },
    age: {
        fontSize: 80,
        fontWeight: '200',
        color: '#FFFFFF',
        lineHeight: 80,
        includeFontPadding: false,
    },
    yearsOld: {
        fontSize: 14,
        fontWeight: '300',
        letterSpacing: 2,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: 5,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        marginTop: 15,
        fontWeight: '300',
        textAlign: 'center',
        maxWidth: '90%',
    },
    sparkleTop: {
        position: 'absolute',
        top: -40,
        right: -10,
        opacity: 0.8,
    },
    sparkleBottom: {
        position: 'absolute',
        bottom: -40,
        left: -10,
        opacity: 0.8,
    },
});
