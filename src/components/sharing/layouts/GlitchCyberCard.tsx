import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BirthdayInfo, CardState } from '../types';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

export const GlitchCyberCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string[]> = {
        sunset: ['#000000', '#FF0055', '#FFD500'],
        ocean: ['#050014', '#00F0FF', '#7000FF'],
        forest: ['#001a05', '#00FF41', '#CCFF00'],
        rose: ['#1a000d', '#FF0099', '#33001B'],
        midnight: ['#000000', '#FFFFFF', '#333333'],
        candy: ['#1a0014', '#FF00CC', '#00FFFF'],
        lavender: ['#0a001a', '#D500F9', '#00E5FF'],
        cosmic: ['#050014', '#00F0FF', '#FF003C'],
    };

    const colors = themeColors[theme] || themeColors.cosmic;
    const bg = colors[0];
    const accent = colors[1];
    const highlight = colors[2];

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            {/* Grid Background */}
            <View style={styles.gridOverlay}>
                {[...Array(10)].map((_, i) => (
                    <View key={i} style={[styles.gridLine, { top: i * 60, borderColor: accent, opacity: 0.1 }]} />
                ))}
            </View>

            <View style={[styles.glitchObj, { borderColor: highlight, top: 40, right: 30 }]} />
            <View style={[styles.glitchObj, { borderColor: accent, bottom: 40, left: 30, width: 60, height: 60 }]} />

            <View style={styles.content}>
                <View style={[styles.frame, { borderColor: accent }]}>
                    <Text style={[styles.header, { color: highlight }]}>ERROR 200: AGED_UP</Text>

                    <View style={styles.mainInfo}>
                        <Text style={[styles.name, { color: '#FFF', textShadowColor: accent }]}>
                            {birthday.name.toUpperCase()}
                        </Text>

                        <View style={[styles.ageBadge, { backgroundColor: highlight }]}>
                            <Text style={[styles.age, { color: bg }]}>LVL {birthday.age}</Text>
                        </View>
                    </View>

                    {showPhoto && birthday.photoUrl && (
                        <View style={[styles.photoContainer, { borderColor: accent }]}>
                            <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                            <View style={[styles.scanline, { backgroundColor: highlight }]} />
                        </View>
                    )}

                    {customMessage ? (
                        <View style={[styles.terminal, { borderColor: highlight }]}>
                            <Text style={[styles.prompt, { color: accent }]}>{'>'} SYSTEM.WISH()</Text>
                            <Text style={[styles.message, { color: '#FFF' }]}>{customMessage}</Text>
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
    gridOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        borderBottomWidth: 1,
    },
    glitchObj: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderWidth: 2,
        opacity: 0.5,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    frame: {
        flex: 1,
        borderWidth: 2,
        padding: 20,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    header: {
        fontSize: 14,
        fontFamily: 'Courier', // Monospace fix
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 20,
    },
    mainInfo: {
        marginBottom: 20,
    },
    name: {
        fontSize: 42,
        fontWeight: '900',
        fontFamily: 'Courier',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 0,
        marginBottom: 10,
    },
    ageBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    age: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Courier',
    },
    photoContainer: {
        width: '100%',
        height: 200,
        borderWidth: 2,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    scanline: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
        opacity: 0.6,
    },
    terminal: {
        borderTopWidth: 1,
        paddingTop: 15,
    },
    prompt: {
        fontSize: 12,
        fontFamily: 'Courier',
        marginBottom: 5,
    },
    message: {
        fontSize: 16,
        fontFamily: 'Courier',
        lineHeight: 22,
    },
});
