import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinimalEleganceCard } from './layouts/MinimalEleganceCard';
import { RetroNeonCard } from './layouts/RetroNeonCard';
import { GeometricModernCard } from './layouts/GeometricModernCard';
import { StarryNightCard } from './layouts/StarryNightCard';
import { GlassmorphismCard } from './layouts/GlassmorphismCard';
import { CardState, BirthdayInfo, CardElement } from './types';
import { DraggableElement } from './DraggableElement';

interface CardCanvasProps {
    birthday: BirthdayInfo;
    state: CardState;
    selectedElementId: string | null;
    onUpdateElement: (id: string, updates: Partial<CardElement>) => void;
    onDeleteElement: (id: string) => void;
    onSelectElement: (id: string | null) => void;
}

export const CardCanvas = ({
    birthday,
    state,
    selectedElementId,
    onUpdateElement,
    onDeleteElement,
    onSelectElement
}: CardCanvasProps) => {
    // Canvas dimensions (1080x1920 scaled down for preview, view-shot handles capture size)
    // For preview, we use flexible dimensions. The layout components handle the aspect ratio.

    const renderLayout = () => {
        switch (state.layoutId) {
            case 'minimal_elegance':
                return <MinimalEleganceCard birthday={birthday} state={state} />;
            case 'retro_neon':
                return <RetroNeonCard birthday={birthday} state={state} />;
            case 'geometric_modern':
                return <GeometricModernCard birthday={birthday} state={state} />;
            case 'starry_night':
                return <StarryNightCard birthday={birthday} state={state} />;
            case 'glassmorphism':
                return <GlassmorphismCard birthday={birthday} state={state} />;
            default:
                // Fallback to minimal if layout not found
                return <MinimalEleganceCard birthday={birthday} state={state} />;
        }
    };

    return (
        <View style={styles.canvas}>
            {renderLayout()}

            {/* Dynamic Elements Layer */}
            {state.elements.map(el => (
                <DraggableElement
                    key={el.id}
                    element={el}
                    isSelected={selectedElementId === el.id}
                    onSelect={() => onSelectElement(el.id)}
                    onUpdate={(updates) => onUpdateElement(el.id, updates)}
                    onDelete={() => onDeleteElement(el.id)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    canvas: {
        width: 225, // Adjusted for safe margin
        height: 390, // Adjusted for safe margin (9:16)
        overflow: 'hidden',
        backgroundColor: '#000',
        borderRadius: 12,
    }
});
