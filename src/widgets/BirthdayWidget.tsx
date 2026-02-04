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

const GradientContainer = (props: {
    children: React.ReactNode,
    style?: any,
    isToday?: boolean,
    clickAction?: string,
    clickActionData?: any
}) => {
    const { children, style = {}, clickAction, clickActionData } = props;

    // We flatten the hierarchy by using a single FlexWidget instead of OverlapWidget + 2 FlexWidgets
    // This reduces depth by 2 levels, making RemoteViews updates much more stable on Android.
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#161616', // Dark matte base
                borderRadius: style.borderRadius || 20,
                padding: style.padding || 14,
                flexDirection: style.flexDirection || 'column',
                justifyContent: style.justifyContent || 'flex-start',
                alignItems: style.alignItems || 'flex-start',
                ...style
            }}
            clickAction={clickAction}
            clickActionData={clickActionData}
        >
            {children}
        </FlexWidget>
    );
};

/**
 * SMALL WIDGET (2x2) - Minimalist countdown
 */
export const SmallBirthdayWidget = ({ id, name, daysUntil, age }: any) => {
    const isToday = daysUntil === 0;
    const titleText = isToday ? 'TODAY' : `${daysUntil}d`;
    const accentColor = isToday ? '#FFD700' : '#FF9500';

    return (
        <GradientContainer
            isToday={isToday}
            style={{ borderRadius: 18, padding: 16 }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: "birthdaybuddy://calendar" }}
        >
            <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 'match_parent' }}>
                <TextWidget text="🎂" style={{ fontSize: 20, color: '#D9FFFFFF' }} />

                <FlexWidget style={{
                    backgroundColor: isToday ? accentColor : '#2A2A2A',
                    paddingHorizontal: 12,
                    paddingVertical: 5,
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

            <FlexWidget style={{ flex: 1, justifyContent: 'center', width: 'match_parent', paddingVertical: 8 }}>
                <TextWidget
                    text={(name || 'Birthday').toUpperCase()}
                    style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        letterSpacing: 0.5
                    }}
                    maxLines={1}
                />
            </FlexWidget>

            <FlexWidget style={{ width: 'match_parent', alignItems: 'flex-start' }}>
                <FlexWidget style={{
                    backgroundColor: '#1E1E1E',
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
                            color: '#B5B5B5',
                            fontWeight: '500'
                        }}
                    />
                </FlexWidget>
            </FlexWidget>
        </GradientContainer>
    );
};

/**
 * Helper: Upcoming Item Row
 */
const UpcomingItem = ({ name, date, daysUntil, isToday }: any) => {
    const accentColor = isToday ? '#FFD700' : '#FF9500';
    const dayText = daysUntil === 0 ? 'Today' : daysUntil === 1 ? '1d' : `${daysUntil}d`;

    return (
        <FlexWidget style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 'match_parent',
            paddingVertical: 5,
            borderBottomColor: '#252525',
            borderBottomWidth: 1
        }}>
            <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <TextWidget
                    text={name}
                    style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '500' }}
                    maxLines={1}
                />
            </FlexWidget>
            <FlexWidget style={{
                backgroundColor: isToday ? '#FFD70022' : '#2A2A2A',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                marginLeft: 4
            }}>
                <TextWidget
                    text={dayText}
                    style={{ fontSize: 9, color: accentColor, fontWeight: 'bold' }}
                />
            </FlexWidget>
        </FlexWidget>
    );
};

/**
 * MEDIUM WIDGET (4x2) - The "Peak" UI with more context
 */
export const MediumBirthdayWidget = ({ id, name, daysUntil, date, age, photoUrl, upcoming = [] }: WidgetProps) => {
    const isToday = daysUntil === 0;
    const isTomorrow = daysUntil === 1;

    // Status logic
    const statusText = isToday ? 'IT\'S TODAY!' : isTomorrow ? 'TOMORROW' : `IN ${daysUntil} DAYS`;
    const statusColor = isToday ? '#FFD700' : isTomorrow ? '#FF9500' : '#B5B5B5';

    const bDate = new Date(date);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateText = !isNaN(bDate.getTime())
        ? `${monthNames[bDate.getUTCMonth()]} ${bDate.getUTCDate()}`
        : date || "";

    // Image safety check - ensure URL is valid if provided
    const hasValidPhoto = !!photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('file') || photoUrl.startsWith('content'));

    return (
        <GradientContainer
            isToday={isToday}
            style={{
                borderRadius: 24,
                padding: 0,
                flexDirection: 'row',
                height: 'match_parent', // Explicit match_parent
                width: 'match_parent'
            }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: `birthdaybuddy://birthday/${id}` }}
        >
            <FlexWidget style={{
                flexDirection: 'row',
                height: 'match_parent',
                width: 'match_parent',
                padding: 14 // Internal padding for content
            }}>
                {/* Left Column - Featured Person - Fixed ratio for stability */}
                <FlexWidget style={{ flex: 13, justifyContent: 'center', paddingRight: 10 }}>
                    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        {/* Avatar Container */}
                        <FlexWidget style={{
                            width: 52, height: 52, borderRadius: 26,
                            backgroundColor: '#252525',
                            justifyContent: 'center', alignItems: 'center',
                            borderColor: isToday ? '#FFD700' : '#333333',
                            borderWidth: 2,
                            marginRight: 10
                        }}>
                            {hasValidPhoto ? (
                                <ImageWidget
                                    image={{ uri: photoUrl } as any}
                                    imageWidth={52}
                                    imageHeight={52}
                                    style={{ width: 52, height: 52, borderRadius: 26 }}
                                />
                            ) : (
                                <TextWidget
                                    text={(name || '?').charAt(0).toUpperCase()}
                                    style={{ fontSize: 22, fontWeight: 'bold', color: isToday ? '#FFD700' : '#FFFFFF' }}
                                />
                            )}
                        </FlexWidget>

                        <FlexWidget style={{ flex: 1 }}>
                            <TextWidget
                                text={statusText}
                                style={{ fontSize: 9, color: statusColor, fontWeight: 'bold', letterSpacing: 0.8 }}
                            />
                            <TextWidget
                                text={(name || 'Buddy').toUpperCase()}
                                style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginTop: 2 }}
                                maxLines={1}
                            />
                        </FlexWidget>
                    </FlexWidget>

                    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FlexWidget style={{
                            backgroundColor: isToday ? '#FFD700' : '#2A2A2A',
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            marginRight: 8
                        }}>
                            <TextWidget
                                text={`AGE ${age}`}
                                style={{ fontSize: 10, color: isToday ? '#000000' : '#FFFFFF', fontWeight: 'bold' }}
                            />
                        </FlexWidget>
                        <TextWidget
                            text={dateText}
                            style={{ fontSize: 11, color: '#B5B5B5', fontWeight: '500' }}
                        />
                    </FlexWidget>

                    {isToday && (
                        <FlexWidget style={{ marginTop: 8 }}>
                            <TextWidget
                                text="✨ Make their day special!"
                                style={{ fontSize: 9, color: '#FFD700', fontStyle: 'italic' }}
                            />
                        </FlexWidget>
                    )}
                </FlexWidget>

                {/* Vertical Divider - Fixed width for stability */}
                <FlexWidget style={{ width: 1, backgroundColor: '#252525', marginVertical: 8 }} />

                {/* Right Column - Upcoming List - Fixed ratio for stability */}
                <FlexWidget style={{ flex: 10, paddingLeft: 12, justifyContent: 'center' }}>
                    <TextWidget
                        text="UPCOMING"
                        style={{ fontSize: 8, color: '#666666', fontWeight: 'bold', marginBottom: 6, letterSpacing: 1.2 }}
                    />

                    <FlexWidget style={{ width: 'match_parent' }}>
                        {upcoming && upcoming.length > 0 ? (
                            upcoming.slice(0, 3).map((item, idx) => (
                                <UpcomingItem
                                    key={item.id || idx}
                                    name={item.name}
                                    daysUntil={item.daysUntil}
                                    isToday={item.daysUntil === 0}
                                />
                            ))
                        ) : (
                            <FlexWidget style={{ paddingVertical: 10, alignItems: 'center' }}>
                                <TextWidget
                                    text="No more soon"
                                    style={{ fontSize: 9, color: '#444444' }}
                                />
                            </FlexWidget>
                        )}
                    </FlexWidget>
                </FlexWidget>
            </FlexWidget>
        </GradientContainer>
    );
};

export const EmptyBirthdayWidget = () => (
    <GradientContainer
        style={{ padding: 24, justifyContent: 'center', alignItems: 'center', borderRadius: 24 }}
        clickAction="OPEN_APP"
    >
        <FlexWidget style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: '#2A2A2A',
            justifyContent: 'center', alignItems: 'center',
            marginBottom: 16,
            borderColor: '#333333',
            borderWidth: 1
        }}>
            <TextWidget text="🎂" style={{ fontSize: 26, color: '#CCFFFFFF' }} />
        </FlexWidget>

        <FlexWidget style={{ width: 'match_parent', alignItems: 'center', justifyContent: 'center' }}>
            <TextWidget
                text="NO BIRTHDAYS"
                style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold', letterSpacing: 1.2 }}
            />
            <TextWidget
                text="Add buddies to see them here"
                style={{ fontSize: 11, color: '#B5B5B5', marginTop: 6 }}
            />
        </FlexWidget>

        <FlexWidget style={{
            backgroundColor: '#FF9500',
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 12,
            marginTop: 20
        }} clickAction="OPEN_APP">
            <TextWidget text="Get Started" style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 'bold' }} />
        </FlexWidget>
    </GradientContainer>
);

export const BirthdayWidget = MediumBirthdayWidget;
