import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface WidgetProps {
    name: string;
    daysUntil: number;
    date: string;
    age: number;
}

export const BirthdayWidget = ({ name, daysUntil, date, age }: WidgetProps) => {
    const isToday = daysUntil === 0;
    const titleText = isToday ? '🎉 BIRTHDAY TODAY! 🎉' : 'NEXT BIRTHDAY';

    // Handle different day scenarios
    let dayText: string;
    if (isToday) {
        dayText = 'TODAY';
    } else if (daysUntil === 1) {
        dayText = 'TOMORROW';
    } else {
        dayText = `IN ${daysUntil} DAYS`;
    }

    // Calculate progress bar width (max 30 days)
    const progressPercent = Math.max(0, Math.min(100, ((30 - daysUntil) / 30) * 100));

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#1A1A1A',
                borderRadius: 16,
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 16,
            }}
            clickAction="OPEN_APP"
        >
            {/* Header Row */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: 'match_parent',
                }}
            >
                <TextWidget
                    text={titleText}
                    style={{
                        fontSize: 12,
                        color: isToday ? '#FF6B35' : '#FF9500',
                        fontWeight: 'bold',
                        letterSpacing: 1.5,
                    }}
                />
                <TextWidget
                    text="🎂"
                    style={{
                        fontSize: 20,
                    }}
                />
            </FlexWidget>

            {/* Main Content */}
            <FlexWidget
                style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'match_parent',
                    flex: 1,
                }}
            >
                <TextWidget
                    text={name.toUpperCase()}
                    style={{
                        fontSize: 22,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        marginBottom: 8,
                    }}
                />
                <TextWidget
                    text={age > 0 ? `${dayText} • TURNING ${age}` : dayText}
                    style={{
                        fontSize: 13,
                        color: '#AAAAAA',
                        textAlign: 'center',
                    }}
                />
            </FlexWidget>

            {/* Progress Bar */}
            <FlexWidget
                style={{
                    width: 'match_parent',
                    height: 6,
                    backgroundColor: '#2A2A2A',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <FlexWidget
                    style={{
                        width: `${progressPercent}%`,
                        height: 'match_parent',
                        backgroundColor: isToday ? '#FF6B35' : '#FF9500',
                        borderRadius: 3,
                    }}
                />
            </FlexWidget>

            {/* Footer Info */}
            <TextWidget
                text={`Updated: ${new Date().toLocaleDateString()}`}
                style={{
                    fontSize: 9,
                    color: '#666666',
                    textAlign: 'center',
                    marginTop: 8,
                }}
            />
        </FlexWidget>
    );
};
