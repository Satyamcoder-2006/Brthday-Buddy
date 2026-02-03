import React from 'react';
import { FlexWidget, TextWidget, ImageWidget, OverlapWidget } from 'react-native-android-widget';

export interface BirthdayData {
    id: string;
    name: string;
    daysUntil: number;
    date: string;
    age: number;
    photoUrl?: string;
}

interface WidgetProps extends BirthdayData {
    upcoming?: BirthdayData[];
}

/**
 * Pseudo-Gradient Container
 * Uses OverlapWidget for layering to simulate a gradient
 */
const GradientContainer = (props: {
    children: React.ReactNode,
    style?: any,
    isToday?: boolean,
    clickAction?: string,
    clickActionData?: any
}) => {
    const { children, style = {}, isToday = false, clickAction, clickActionData } = props;
    return (
        <OverlapWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
            }}
            clickAction={clickAction}
            clickActionData={clickActionData}
        >
            <FlexWidget
                style={{
                    height: 'match_parent',
                    width: 'match_parent',
                    backgroundColor: '#161616', // smooth dark matte
                    borderRadius: style.borderRadius || 20,
                }}
            />
            {/* Subtle Gradient Overlay Simulation if possible, or just keeping it clean matte */}

            <FlexWidget
                style={{
                    height: 'match_parent',
                    width: 'match_parent',
                    padding: style.padding || 14,
                    flexDirection: style.flexDirection || 'column',
                    justifyContent: style.justifyContent || 'flex-start',
                    alignItems: style.alignItems || 'flex-start',
                }}
            >
                {children}
            </FlexWidget>
        </OverlapWidget>
    );
};

/**
 * SMALL WIDGET (2x2) - Minimalist countdown
 */
export const SmallBirthdayWidget = ({ id, name, daysUntil, age }: any) => {
    const isToday = daysUntil === 0;
    const titleText = isToday ? 'TODAY' : `${daysUntil}d`;
    // Amber/Gold accent
    const accentColor = '#C87C1E';

    return (
        <GradientContainer
            isToday={isToday}
            style={{ borderRadius: 18, padding: 14 }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: "birthdaybuddy://calendar" }}
        >
            <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 'match_parent' }}>
                <TextWidget text="🎂" style={{ fontSize: 18, color: '#D9FFFFFF' }} />

                <FlexWidget style={{
                    backgroundColor: isToday ? accentColor : '#2A2A2A',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderColor: isToday ? accentColor : '#333333',
                    borderWidth: 1
                }}>
                    <TextWidget
                        text={titleText}
                        style={{
                            fontSize: 12,
                            color: isToday ? '#1A1A1A' : accentColor,
                            fontWeight: 'bold'
                        }}
                    />
                </FlexWidget>
            </FlexWidget>

            <FlexWidget style={{ flex: 1, justifyContent: 'center', width: 'match_parent', paddingVertical: 4 }}>
                <TextWidget
                    text={(name || 'Birthday').toUpperCase()}
                    style={{
                        fontSize: 15,
                        fontWeight: '600', // Semi-bold approximation
                        color: '#FFFFFF',
                        letterSpacing: 1.0 // +1 (not percent, but unit in native text widget usually scaled)
                    }}
                    maxLines={1}
                />
            </FlexWidget>

            <FlexWidget style={{ width: 'match_parent', alignItems: 'flex-start' }}>
                <FlexWidget style={{
                    backgroundColor: '#1E1E1E', // Darker base for pill
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 12,
                    borderColor: '#2A2A2A',
                    borderWidth: 1,
                    width: 'match_parent',
                    alignItems: 'center'
                }}>
                    <TextWidget
                        text={`Turning ${age || '?'}`}
                        style={{
                            fontSize: 11,
                            color: '#B5B5B5', // Secondary text
                            fontWeight: '500'
                        }}
                    />
                </FlexWidget>
            </FlexWidget>
        </GradientContainer>
    );
};

/**
 * MEDIUM WIDGET (4x2) - The "Peak" UI with actions
 */
export const MediumBirthdayWidget = ({ id, name, daysUntil, date, age, photoUrl }: WidgetProps) => {
    const isToday = daysUntil === 0;
    const isTomorrow = daysUntil === 1;
    const titleText = isToday ? '🎉 TODAY' : isTomorrow ? 'TOMORROW' : `IN ${daysUntil} DAYS`;
    const accentColor = '#C87C1E'; // Burnt gold
    const secondaryColor = '#B5B5B5';

    const bDate = new Date(date);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateText = `${monthNames[bDate.getUTCMonth()]} ${bDate.getUTCDate()}`;

    return (
        <GradientContainer
            isToday={isToday}
            style={{ borderRadius: 20, padding: 16, flexDirection: 'row' }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: `birthdaybuddy://birthday/${id}` }}
        >
            {/* Avatar with Profile Photo */}
            <FlexWidget style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: '#2A2A2A', // Darker placeholder bg
                marginRight: 18,
                justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
                borderColor: isToday ? accentColor : '#333333',
                borderWidth: 1
            }}>
                {photoUrl ? (
                    <ImageWidget image={{ uri: photoUrl } as any} imageWidth={72} imageHeight={72} style={{ width: 72, height: 72, borderRadius: 36 }} />
                ) : (
                    <TextWidget text={(name || '?').charAt(0).toUpperCase()} style={{ fontSize: 28, fontWeight: 'bold', color: isToday ? accentColor : '#FFFFFF' }} />
                )}
            </FlexWidget>

            {/* Info */}
            <FlexWidget style={{ flex: 1, justifyContent: 'center' }}>
                <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                    <FlexWidget style={{
                        backgroundColor: isToday ? accentColor : '#2A2A2A',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                        borderColor: isToday ? accentColor : '#333333',
                        borderWidth: 1
                    }}>
                        <TextWidget text={titleText} style={{ fontSize: 11, color: isToday ? '#1A1A1A' : accentColor, fontWeight: 'bold' }} />
                    </FlexWidget>

                    <FlexWidget style={{
                        backgroundColor: '#1E1E1E',
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                        borderRadius: 8,
                        borderColor: '#2A2A2A',
                        borderWidth: 1
                    }}>
                        <TextWidget text={`AGE ${age}`} style={{ fontSize: 10, color: secondaryColor, fontWeight: 'bold' }} />
                    </FlexWidget>
                </FlexWidget>

                <FlexWidget style={{ justifyContent: 'center', width: 'match_parent', marginTop: 2 }}>
                    <TextWidget
                        text={(name || 'Birthday').toUpperCase()}
                        style={{ fontSize: 19, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.5 }}
                        maxLines={1}
                    />
                    <TextWidget
                        text={dateText || ''}
                        style={{ fontSize: 13, color: secondaryColor, marginTop: 4, fontWeight: '500' }}
                    />
                </FlexWidget>
            </FlexWidget>
        </GradientContainer>
    );
};

export const EmptyBirthdayWidget = () => (
    <GradientContainer
        style={{ padding: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 20 }}
        clickAction="OPEN_APP"
    >
        <FlexWidget style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <TextWidget text="🎂" style={{ fontSize: 32, color: '#CCFFFFFF' }} />
        </FlexWidget>

        <FlexWidget style={{ width: 'match_parent', alignItems: 'center', height: 60, justifyContent: 'center' }}>
            <TextWidget text="NO BIRTHDAYS" style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', letterSpacing: 0.5 }} />
            <TextWidget text="Tap to add first buddy" style={{ fontSize: 12, color: '#B5B5B5', marginTop: 4 }} />
        </FlexWidget>

        <FlexWidget style={{
            backgroundColor: '#C87C1E', // Accent
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            marginTop: 10
        }} clickAction="OPEN_APP">
            <TextWidget text="Open App" style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 'bold' }} />
        </FlexWidget>
    </GradientContainer>
);

export const BirthdayWidget = MediumBirthdayWidget;
