import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, PanResponder, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardElement } from './types';
import { colors } from '../../theme';

interface Props {
    element: CardElement;
    onUpdate: (updates: Partial<CardElement>) => void;
    onDelete: () => void;
    onSelect: () => void;
    isSelected: boolean;
}

export const DraggableElement = ({ element, onUpdate, onDelete, onSelect, isSelected }: Props) => {
    // We use PanResponder for stability across platforms in this setup
    const pan = useRef(new Animated.ValueXY({ x: element.x, y: element.y })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                onSelect();
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (e, gestureState) => {
                pan.flattenOffset();
                onUpdate({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value
                });
            }
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                        { scale: element.scale },
                        { rotate: `${element.rotation}deg` }
                    ]
                }
            ]}
            {...panResponder.panHandlers}
        >
            <View style={[styles.elementWrapper, isSelected && styles.selectedWrapper]}>
                {element.type === 'text' ? (
                    <Text style={[styles.text, { fontSize: element.fontSize, color: element.color }]}>
                        {element.content}
                    </Text>
                ) : (
                    <Text style={styles.sticker}>{element.content}</Text>
                )}

                {isSelected && (
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 1000,
    },
    elementWrapper: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedWrapper: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        borderStyle: 'dashed',
    },
    text: {
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
    },
    sticker: {
        fontSize: 60,
    },
    deleteBtn: {
        position: 'absolute',
        top: -15,
        right: -15,
        backgroundColor: '#FFF',
        borderRadius: 12,
    }
});
