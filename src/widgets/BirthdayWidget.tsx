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
                    backgroundColor: '#1A1A1A',
                    borderRadius: style.borderRadius || 20,
                }}
            />
            <FlexWidget
                style={{
                    height: 'match_parent',
                    width: 'match_parent',
                    padding: style.padding || 12,
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
    const titleText = isToday ? 'TODAY!' : `${daysUntil}d`;

    return (
        <GradientContainer
            isToday={isToday}
            style={{ borderRadius: 16, padding: 12 }}
            clickAction="OPEN_APP"
        >
            <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 'match_parent' }}>
                <TextWidget text="🎂" style={{ fontSize: 16 }} />
                <FlexWidget style={{ backgroundColor: '#FF9500', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                    <TextWidget text={titleText} style={{ fontSize: 10, color: '#1A1A1A', fontWeight: 'bold' }} />
                </FlexWidget>
            </FlexWidget>

            <FlexWidget style={{ height: 40, justifyContent: 'center', width: 'match_parent', marginTop: 4 }}>
                <TextWidget
                    text={(name || 'Birthdays').toUpperCase()}
                    style={{ fontSize: 16, fontWeight: 'bold', color: '#FF9500' }}
                />
            </FlexWidget>

            <FlexWidget style={{ backgroundColor: '#FF950033', paddingVertical: 4, borderRadius: 8, alignItems: 'center', width: 'match_parent', marginTop: 4 }}>
                <TextWidget text={`Turning ${age || '?'}`} style={{ fontSize: 10, color: '#FF9500', fontWeight: 'bold' }} />
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
    const titleText = isToday ? '🎉 TODAY!' : isTomorrow ? 'TOMORROW' : `IN ${daysUntil} DAYS`;
    const titleBgColor = '#FF9500';
    const titleTextColor = '#1A1A1A';

    const bDate = new Date(date);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateText = `${monthNames[bDate.getUTCMonth()]} ${bDate.getUTCDate()}`;

    return (
        <GradientContainer
            isToday={isToday}
            style={{ borderRadius: 20, padding: 16, flexDirection: 'row' }}
            clickAction="OPEN_APP"
        >
            {/* Avatar with Profile Photo */}
            <FlexWidget style={{
                width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF950033',
                marginRight: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
            }}>
                {photoUrl ? (
                    <ImageWidget image={{ uri: photoUrl } as any} imageWidth={70} imageHeight={70} style={{ width: 70, height: 70, borderRadius: 35 }} />
                ) : (
                    <TextWidget text={(name || '?').charAt(0).toUpperCase()} style={{ fontSize: 32, fontWeight: 'bold', color: '#FF9500', fontFamily: 'sans-serif-medium' }} />
                )}
            </FlexWidget>

            {/* Info */}
            <FlexWidget style={{ flex: 1 }}>
                <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <FlexWidget style={{ backgroundColor: titleBgColor, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <TextWidget text={titleText} style={{ fontSize: 10, color: titleTextColor, fontWeight: 'bold' }} />
                    </FlexWidget>
                    <FlexWidget style={{ backgroundColor: '#FF950033', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <TextWidget text={`AGE ${age}`} style={{ fontSize: 10, color: '#FF9500', fontWeight: 'bold' }} />
                    </FlexWidget>
                </FlexWidget>

                <FlexWidget style={{ flex: 1, justifyContent: 'center', width: 'match_parent' }}>
                    <TextWidget text={(name || 'Birthday').toUpperCase()} style={{ fontSize: 18, fontWeight: 'bold', color: '#FF9500' }} />
                    <TextWidget text={dateText || ''} style={{ fontSize: 12, color: '#FF9500CC', fontWeight: 'bold' }} />
                </FlexWidget>
            </FlexWidget>
        </GradientContainer>
    );
};

const BirthdayListItem = ({ birthday }: { birthday: BirthdayData }) => {
    const isToday = birthday.daysUntil === 0;

    return (
        <FlexWidget
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF950026', borderRadius: 12, padding: 10, marginBottom: 6 }}
            clickAction="OPEN_APP"
        >
            <FlexWidget style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF950040', marginRight: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                {birthday.photoUrl ? (
                    <ImageWidget image={{ uri: birthday.photoUrl } as any} imageWidth={36} imageHeight={36} style={{ width: 36, height: 36, borderRadius: 18 }} />
                ) : (
                    <TextWidget text={(birthday.name || '?').charAt(0).toUpperCase()} style={{ fontSize: 16, color: '#FF9500', fontWeight: 'bold', fontFamily: 'sans-serif-medium' }} />
                )}
            </FlexWidget>

            <FlexWidget style={{ flex: 1 }}>
                <TextWidget text={birthday.name || ''} style={{ fontSize: 14, fontWeight: 'bold', color: '#FF9500' }} />
                <TextWidget text={`Turning ${birthday.age || ''}`} style={{ fontSize: 11, color: '#FF9500CC' }} />
            </FlexWidget>

            <FlexWidget style={{ backgroundColor: isToday ? '#FF9500' : '#FF950033', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                <TextWidget text={isToday ? 'TODAY' : `${birthday.daysUntil}d`} style={{ fontSize: 10, color: isToday ? '#1A1A1A' : '#FF9500', fontWeight: 'bold', fontFamily: 'sans-serif' }} />
            </FlexWidget>
        </FlexWidget>
    );
};

/**
 * LARGE WIDGET (4x4) - Upcoming list
 */
export const LargeBirthdayWidget = ({ upcoming = [] }: WidgetProps) => {
    return (
        <GradientContainer style={{ padding: 16, borderRadius: 24, flexDirection: 'column' }} clickAction="OPEN_APP">
            <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <TextWidget text="UPCOMING BIRTHDAYS" style={{ fontSize: 11, fontWeight: 'bold', color: '#FF9500' }} />
                <TextWidget text="🎂" style={{ fontSize: 16 }} />
            </FlexWidget>

            <FlexWidget style={{ flex: 1 }}>
                {upcoming.length > 0 ? (
                    upcoming.slice(0, 4).map((b, i) => (
                        <BirthdayListItem key={b.id || i} birthday={b} />
                    ))
                ) : (
                    <FlexWidget style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <TextWidget text="No upcoming birthdays" style={{ color: '#FF9500CC', fontFamily: 'sans-serif' }} />
                    </FlexWidget>
                )}
            </FlexWidget>

            <FlexWidget style={{ backgroundColor: '#FF950033', borderRadius: 12, padding: 10, marginTop: 8, alignItems: 'center' }} clickAction="OPEN_APP">
                <TextWidget text="View All Birthdays →" style={{ fontSize: 12, color: '#FF9500', fontWeight: 'bold' }} />
            </FlexWidget>
        </GradientContainer>
    );
};

export const EmptyBirthdayWidget = () => (
    <GradientContainer
        style={{ padding: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 20 }}
        clickAction="OPEN_APP"
    >
        <FlexWidget style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF9500', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <TextWidget text="🎂" style={{ fontSize: 40 }} />
        </FlexWidget>

        <FlexWidget style={{ width: 'match_parent', alignItems: 'center', height: 60, justifyContent: 'center' }}>
            <TextWidget text="NO BIRTHDAYS" style={{ fontSize: 18, color: '#FF9500', fontWeight: 'bold' }} />
            <TextWidget text="Tap to add" style={{ fontSize: 12, color: '#FF9500' }} />
        </FlexWidget>

        <FlexWidget style={{ backgroundColor: '#FF9500', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, marginTop: 10 }} clickAction="OPEN_APP">
            <TextWidget text="Open App" style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 'bold' }} />
        </FlexWidget>
    </GradientContainer>
);

export const BirthdayWidget = MediumBirthdayWidget;
