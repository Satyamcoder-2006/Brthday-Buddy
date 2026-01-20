import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardState, LayoutId, ColorTheme } from './types';
import { colors, spacing, typography, borderRadius } from '../../theme';

import { getCardMessageSuggestions } from '../../services/ai';
import { Birthday } from '../../types';

interface Props {
    state: CardState;
    onChange: (newState: CardState) => void;
    birthday: Birthday;
}

type Tab = 'layout' | 'color' | 'text' | 'stickers' | 'photo';

export const CustomizationPanel = ({ state, onChange, birthday }: Props) => {
    const [activeTab, setActiveTab] = useState<Tab>('layout');
    const [aiMessages, setAiMessages] = useState<string[]>(['Happy Birthday! 🎂', 'Best Year Yet! ✨', 'HBD! 🎈', 'Cheers! 🥂', 'Legend! 👑', 'Make a Wish! 🌟']);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        try {
            const msgs = await getCardMessageSuggestions(birthday);
            setAiMessages(msgs);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const updateState = (updates: Partial<CardState>) => {
        onChange({ ...state, ...updates });
    };

    const tabs: { id: Tab; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
        { id: 'layout', icon: 'grid-outline', label: 'Layout' },
        { id: 'color', icon: 'color-palette-outline', label: 'Colors' },
        { id: 'text', icon: 'text-outline', label: 'Text' },
        { id: 'stickers', icon: 'happy-outline', label: 'Stickers' },
        { id: 'photo', icon: 'image-outline', label: 'Photo' },
    ];

    const themes: { id: ColorTheme; color: string; label: string }[] = [
        { id: 'sunset', color: '#FF9500', label: 'Sunset' },
        { id: 'ocean', color: '#00C7BE', label: 'Ocean' },
        { id: 'forest', color: '#30B0C7', label: 'Forest' },
        { id: 'rose', color: '#FF2D55', label: 'Rose' },
        { id: 'midnight', color: '#000000', label: 'Midnight' },
        { id: 'candy', color: '#AF52DE', label: 'Candy' },
        { id: 'lavender', color: '#5856D6', label: 'Lavender' },
        { id: 'cosmic', color: '#5AC8FA', label: 'Cosmic' },
    ];

    const layouts: { id: LayoutId; label: string }[] = [
        { id: 'minimal_elegance', label: 'Minimal' },
        { id: 'gradient_waves', label: 'Waves' },
        { id: 'confetti_burst', label: 'Confetti' },
        { id: 'retro_neon', label: 'Neon' },
        { id: 'floral_dream', label: 'Floral' },
        { id: 'geometric_modern', label: 'Modern' },
        { id: 'balloon_party', label: 'Balloons' },
        { id: 'starry_night', label: 'Starry' },
    ];

    return (
        <View style={styles.container}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={20}
                            color={activeTab === tab.id ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[
                            styles.tabLabel,
                            activeTab === tab.id && styles.activeTabLabel
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content Area */}
            <View style={styles.content}>

                {/* LAYOUT SELECTOR */}
                {activeTab === 'layout' && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {layouts.map((layout) => (
                            <TouchableOpacity
                                key={layout.id}
                                style={[
                                    styles.optionCard,
                                    state.layoutId === layout.id && styles.activeOptionCard
                                ]}
                                onPress={() => updateState({ layoutId: layout.id })}
                            >
                                <View style={styles.layoutPreview}>
                                    <Text style={styles.layoutPreviewText}>Aa</Text>
                                </View>
                                <Text style={[
                                    styles.optionLabel,
                                    state.layoutId === layout.id && styles.activeOptionLabel
                                ]}>{layout.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* COLOR THEME PICKER */}
                {activeTab === 'color' && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {themes.map((theme) => (
                            <TouchableOpacity
                                key={theme.id}
                                style={[
                                    styles.colorOption,
                                    state.theme === theme.id && styles.activeColorOption
                                ]}
                                onPress={() => updateState({ theme: theme.id })}
                            >
                                <View style={[styles.colorSwatch, { backgroundColor: theme.color }]} />
                                <Text style={[
                                    styles.optionLabel,
                                    state.theme === theme.id && styles.activeOptionLabel
                                ]}>{theme.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* TEXT EDITOR */}
                {activeTab === 'text' && (
                    <View style={styles.textEditor}>
                        <View style={styles.aiHeader}>
                            <Text style={styles.sectionLabel}>Suggested Wishes</Text>
                            <TouchableOpacity
                                style={[styles.aiGenerateBtn, isGenerating && styles.aiGenerating]}
                                onPress={handleGenerateAI}
                                disabled={isGenerating}
                            >
                                <Ionicons name="sparkles" size={12} color={colors.primary} />
                                <Text style={styles.aiGenerateText}>
                                    {isGenerating ? 'GEN...' : 'AI REFRESH'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedScroll}>
                            {aiMessages.map(msg => (
                                <TouchableOpacity
                                    key={msg}
                                    style={styles.suggestionChip}
                                    onPress={() => updateState({ customMessage: msg })}
                                >
                                    <View style={styles.chipContent}>
                                        <Text style={styles.suggestionText}>{msg}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Add custom text..."
                                placeholderTextColor={colors.textDisabled}
                                value={state.customMessage}
                                onChangeText={(text) => updateState({ customMessage: text })}
                                maxLength={50}
                            />
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => {
                                    const newText = {
                                        id: Date.now().toString(),
                                        type: 'text' as const,
                                        content: state.customMessage || "New Text",
                                        x: 50,
                                        y: 200,
                                        scale: 1,
                                        rotation: 0,
                                        fontSize: 24,
                                        color: '#FFF'
                                    };
                                    updateState({
                                        elements: [...state.elements, newText],
                                        customMessage: ''
                                    });
                                }}
                            >
                                <Ionicons name="add-circle" size={32} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* STICKERS */}
                {activeTab === 'stickers' && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {['🎈', '🎂', '🥳', '🎁', '🎉', '✨', '💖', '👑', '🥂', '🍰'].map((emoji, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.stickerOption}
                                onPress={() => {
                                    const newSticker = {
                                        id: Date.now().toString(),
                                        type: 'sticker' as const,
                                        content: emoji,
                                        x: 100,
                                        y: 200,
                                        scale: 1,
                                        rotation: 0
                                    };
                                    updateState({ elements: [...state.elements, newSticker] });
                                }}
                            >
                                <Text style={styles.stickerPreview}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* PHOTO TOGGLE */}
                {activeTab === 'photo' && (
                    <View style={styles.photoEditor}>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Show Photo</Text>
                            <Switch
                                value={state.showPhoto}
                                onValueChange={(val) => updateState({ showPhoto: val })}
                                trackColor={{ false: '#333', true: colors.primary }}
                                thumbColor={'#FFF'}
                            />
                        </View>
                        {state.showPhoto && (
                            <Text style={styles.hintText}>Currently showing user's profile photo.</Text>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1A1A1A',
        borderTopWidth: 1,
        borderTopColor: '#333',
        height: 180,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        marginTop: 4,
        fontFamily: typography.fonts.medium,
    },
    activeTabLabel: {
        color: colors.primary,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    optionCard: {
        marginRight: spacing.md,
        alignItems: 'center',
    },
    layoutPreview: {
        width: 60,
        height: 60,
        backgroundColor: '#333',
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    layoutPreviewText: {
        color: '#666',
        fontSize: 20,
        fontFamily: typography.fonts.heading,
    },
    activeOptionCard: {
        // active state style
    },
    optionLabel: {
        color: colors.textSecondary,
        fontSize: 10,
    },
    activeOptionLabel: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    colorOption: {
        marginRight: spacing.lg,
        alignItems: 'center',
    },
    colorSwatch: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: spacing.xs,
        borderWidth: 2,
        borderColor: '#333',
    },
    activeColorOption: {
        // ...
    },
    textEditor: {
        padding: spacing.md,
    },
    suggestedScroll: {
        marginBottom: spacing.sm,
    },
    suggestionChip: {
        backgroundColor: '#333',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        marginRight: spacing.xs,
        borderWidth: 1,
        borderColor: '#444',
    },
    suggestionText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#333',
        color: colors.text,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        fontSize: 14,
    },
    addBtn: {
        marginLeft: spacing.sm,
    },
    aiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingHorizontal: 4,
    },
    sectionLabel: {
        color: colors.textDisabled,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    aiGenerateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,149,0,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,149,0,0.3)',
    },
    aiGenerating: {
        opacity: 0.5,
    },
    aiGenerateText: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stickerOption: {
        marginRight: spacing.md,
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 12,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickerPreview: {
        fontSize: 32,
    },
    photoEditor: {
        padding: spacing.md,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    switchLabel: {
        color: colors.text,
        fontSize: 16,
    },
    hintText: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
});
