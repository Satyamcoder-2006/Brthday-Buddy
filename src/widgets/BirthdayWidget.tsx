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
                    backgroundColor: isToday ? '#FF8C00' : '#FF9500',
                    borderRadius: style.borderRadius || 20,
                    padding: 0
                }}
            />
            <FlexWidget
                style={{
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                    backgroundColor: '#FFFFFF21',
                    marginTop: -40,
                    marginLeft: -40,
                }}
            />
            <FlexWidget
                style={{
                    height: 'match_parent',
                    width: 'match_parent',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    padding: 0
                }}
            >
                <FlexWidget
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        backgroundColor: '#00000014',
                        marginBottom: -30,
                        marginRight: -30,
                    }}
                />
            </FlexWidget>
            <FlexWidget
                style={{
                    height: 'match_parent',
                    width: 'match_parent',
                    padding: style.padding || 0,
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
export const SmallBirthdayWidget = ({ id, name, daysUntil, age }: WidgetProps) => {
    const isToday = daysUntil === 0;
    const titleText = isToday ? 'TODAY!' : `${daysUntil}d`;
    const linkUrl = id ? `birthdaybuddy://birthday/${id}` : 'birthdaybuddy://home';

    return (
        <GradientContainer
            isToday={isToday}
            style={{ borderRadius: 16, padding: 12 }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: linkUrl }}
        >
            <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextWidget text="🎂" style={{ fontSize: 16 }} />
                <FlexWidget style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                    <TextWidget text={titleText} style={{ fontSize: 10, color: '#FF9500', fontWeight: 'bold' }} />
                </FlexWidget>
            </FlexWidget>

            <FlexWidget style={{ flex: 1, justifyContent: 'center', width: 'match_parent' }}>
                <TextWidget
                    text={(name || 'BIRTHDAY').toUpperCase()}
                    style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif-medium' }}
                />
            </FlexWidget>

            <FlexWidget style={{ backgroundColor: '#FFFFFF33', paddingVertical: 4, borderRadius: 8, alignItems: 'center', width: 'match_parent' }}>
                <TextWidget text={`Turning ${age || '?'}`} style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'sans-serif' }} />
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
    const titleBgColor = isToday ? '#FFFFFF' : '#FFFFFF40';
    const titleTextColor = isToday ? '#FF9500' : '#FFFFFF';

    const bDate = new Date(date);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateText = `${monthNames[bDate.getUTCMonth()]} ${bDate.getUTCDate()}`;

    const linkUrl = id ? `birthdaybuddy://birthday/${id}` : 'birthdaybuddy://home';
    const giftSearchUrl = `https://www.google.com/search?q=birthday+gift+ideas+for+${encodeURIComponent(name)}+age+${age}`;

    return (
        <GradientContainer
            isToday={isToday}
            style={{ borderRadius: 20, padding: 16, flexDirection: 'row' }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: linkUrl }}
        >
            {/* Avatar */}
            <FlexWidget style={{
                width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFFFFF33',
                marginRight: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
            }}>
                {photoUrl ? (
                    <ImageWidget image={{ uri: photoUrl } as any} imageWidth={70} imageHeight={70} style={{ width: 70, height: 70, borderRadius: 35 }} />
                ) : (
                    <TextWidget text={(name || '?').charAt(0).toUpperCase()} style={{ fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif-medium' }} />
                )}
            </FlexWidget>

            {/* Info */}
            <FlexWidget style={{ flex: 1 }}>
                <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <FlexWidget style={{ backgroundColor: titleBgColor, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <TextWidget text={titleText} style={{ fontSize: 10, color: titleTextColor, fontWeight: 'bold' }} />
                    </FlexWidget>
                    <FlexWidget style={{ backgroundColor: '#FFFFFF33', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <TextWidget text={`AGE ${age}`} style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' }} />
                    </FlexWidget>
                </FlexWidget>

                <FlexWidget style={{ flex: 1, justifyContent: 'center', width: 'match_parent' }}>
                    <TextWidget text={(name || 'Birthday').toUpperCase()} style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif-medium' }} />
                    <TextWidget text={dateText || ''} style={{ fontSize: 13, color: '#FFFFFFCC', fontWeight: 'bold', fontFamily: 'sans-serif' }} />
                </FlexWidget>

                <FlexWidget style={{ flexDirection: 'row', marginTop: 8, width: 'match_parent' }}>
                    <FlexWidget style={{ flex: 1, backgroundColor: '#00000033', paddingVertical: 6, borderRadius: 10, alignItems: 'center', marginRight: 8 }} clickAction="OPEN_URI" clickActionData={{ uri: giftSearchUrl }}>
                        <TextWidget text="🎁 Gifts" style={{ fontSize: 11, color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'sans-serif' }} />
                    </FlexWidget>
                    <FlexWidget style={{ flex: 1, backgroundColor: '#00000033', paddingVertical: 6, borderRadius: 10, alignItems: 'center' }} clickAction="OPEN_URI" clickActionData={{ uri: linkUrl }}>
                        <TextWidget text="Details →" style={{ fontSize: 11, color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'sans-serif' }} />
                    </FlexWidget>
                </FlexWidget>
            </FlexWidget>
        </GradientContainer>
    );
};

const BirthdayListItem = ({ birthday }: { birthday: BirthdayData }) => {
    const linkUrl = `birthdaybuddy://birthday/${birthday.id}`;
    const isToday = birthday.daysUntil === 0;

    return (
        <FlexWidget
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF26', borderRadius: 12, padding: 10, marginBottom: 6 }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: linkUrl }}
        >
            <FlexWidget style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF40', marginRight: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                {birthday.photoUrl ? (
                    <ImageWidget image={{ uri: birthday.photoUrl } as any} imageWidth={36} imageHeight={36} style={{ width: 36, height: 36, borderRadius: 18 }} />
                ) : (
                    <TextWidget text={(birthday.name || '?').charAt(0).toUpperCase()} style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'sans-serif-medium' }} />
                )}
            </FlexWidget>

            <FlexWidget style={{ flex: 1 }}>
                <TextWidget text={birthday.name || ''} style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif-medium' }} />
                <TextWidget text={`Turning ${birthday.age || ''}`} style={{ fontSize: 11, color: '#FFFFFFB3', fontFamily: 'sans-serif' }} />
            </FlexWidget>

            <FlexWidget style={{ backgroundColor: isToday ? '#FFFFFF' : '#FFFFFF33', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                <TextWidget text={isToday ? 'TODAY' : `${birthday.daysUntil}d`} style={{ fontSize: 10, color: isToday ? '#FF9500' : '#FFFFFF', fontWeight: 'bold', fontFamily: 'sans-serif' }} />
            </FlexWidget>
        </FlexWidget>
    );
};

/**
 * LARGE WIDGET (4x4) - Upcoming list
 */
export const LargeBirthdayWidget = ({ upcoming = [] }: WidgetProps) => {
    return (
        <GradientContainer style={{ padding: 20, borderRadius: 24, flexDirection: 'column' }}>
            <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <TextWidget text="UPCOMING BIRTHDAYS" style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1, fontFamily: 'sans-serif-medium' }} />
                <TextWidget text="🎂" style={{ fontSize: 16 }} />
            </FlexWidget>

            <FlexWidget style={{ flex: 1 }}>
                {upcoming.length > 0 ? (
                    upcoming.slice(0, 4).map((b, i) => (
                        <BirthdayListItem key={b.id || i} birthday={b} />
                    ))
                ) : (
                    <FlexWidget style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <TextWidget text="No upcoming birthdays" style={{ color: '#FFFFFFCC', fontFamily: 'sans-serif' }} />
                    </FlexWidget>
                )}
            </FlexWidget>

            <FlexWidget style={{ backgroundColor: '#FFFFFF33', borderRadius: 12, padding: 10, marginTop: 8, alignItems: 'center' }} clickAction="OPEN_APP">
                <TextWidget text="View All Birthdays →" style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'sans-serif-medium' }} />
            </FlexWidget>
        </GradientContainer>
    );
};

export const EmptyBirthdayWidget = () => (
    <GradientContainer
        style={{ padding: 24, justifyContent: 'center', alignItems: 'center', borderRadius: 20 }}
        clickAction="OPEN_APP"
    >
        <FlexWidget style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF33', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <TextWidget text="🎂" style={{ fontSize: 48 }} />
        </FlexWidget>

        <TextWidget text="NO BIRTHDAYS YET" style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 8, fontFamily: 'sans-serif-medium', width: 'match_parent', textAlign: 'center' }} />
        <TextWidget text="Tap to add your first birthday" style={{ fontSize: 12, color: '#FFFFFFCC', marginBottom: 20, textAlign: 'center', fontFamily: 'sans-serif', width: 'match_parent' }} />

        <FlexWidget style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }} clickAction="OPEN_APP">
            <TextWidget text="Add Birthday" style={{ fontSize: 14, color: '#FF9500', fontWeight: 'bold', fontFamily: 'sans-serif-medium' }} />
        </FlexWidget>
    </GradientContainer>
);

export const BirthdayWidget = MediumBirthdayWidget;
