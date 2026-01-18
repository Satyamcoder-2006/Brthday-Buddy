import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BirthdayInfo, CardState } from '../types';

interface Props {
    birthday: BirthdayInfo;
    state: CardState;
}

export const GeometricModernCard = ({ birthday, state }: Props) => {
    const { theme, customMessage, showPhoto } = state;

    const themeColors: Record<string, string[]> = {
        sunset: ['#FF9500', '#FF3B30'],
        ocean: ['#007AFF', '#5AC8FA'],
        forest: ['#34C759', '#30B0C7'],
        rose: ['#FF2D55', '#FF9500'],
        midnight: ['#333', '#000'],
        candy: ['#AF52DE', '#FF2D55'],
        lavender: ['#5856D6', '#AF52DE'],
        cosmic: ['#5AC8FA', '#007AFF'],
    };

    const colors = themeColors[theme] || themeColors.cosmic;

    return (
        <View style={styles.container}>
            <View style={[styles.bgShape, { backgroundColor: colors[0], top: -50, right: -50, transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.bgShape, { backgroundColor: colors[1], bottom: -80, left: -40, width: 250, height: 250, borderRadius: 125 }]} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.bar, { backgroundColor: colors[0] }]} />
                    <Text style={styles.title}>BIRTHDAY BASH</Text>
                </View>

                {showPhoto && birthday.photoUrl && (
                    <View style={styles.photoContainer}>
                        <View style={[styles.photoBacking, { backgroundColor: colors[0] }]} />
                        <View style={styles.photoFrame}>
                            <Image source={{ uri: birthday.photoUrl }} style={styles.photo} />
                        </View>
                    </View>
                )}

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit>{birthday.name.toUpperCase()}</Text>
                    <Text style={[styles.age, { color: colors[0] }]}>AGE {birthday.age}</Text>
                </View>

                {customMessage ? (
                    <View style={styles.msgContainer}>
                        <Text style={styles.message} numberOfLines={4} adjustsFontSizeToFit>{customMessage}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        overflow: 'hidden',
    },
    bgShape: {
        position: 'absolute',
        width: 200,
        height: 200,
        opacity: 0.2,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    bar: {
        width: 40,
        height: 8,
        marginRight: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 20,
        alignItems: 'center',
    },
    photoBacking: {
        position: 'absolute',
        width: 120,
        height: 120,
        top: 8,
        left: '50%',
        marginLeft: -52, // Center backing
        opacity: 0.3,
    },
    photoFrame: {
        width: 120,
        height: 120,
        backgroundColor: '#000',
        elevation: 10,
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    info: {
        marginBottom: 15,
    },
    name: {
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 34,
    },
    age: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 2,
    },
    msgContainer: {
        borderLeftWidth: 4,
        borderLeftColor: '#000',
        paddingLeft: 12,
        marginTop: 5,
        maxHeight: 80,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 18,
    },
});
