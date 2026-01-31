import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface PartyInvite {
    partyId: string;
    inviterId: string;
}

export class DeepLinkManager {
    /**
     * Parse party invite from URL
     */
    static parsePartyInvite(url: string): PartyInvite | null {
        try {
            const parsed = Linking.parse(url);
            const path = parsed.path;
            const queryParams = parsed.queryParams;

            // Handle: birthdaybuddy://party/abc123
            // Handle: https://birthdaybuddy.app/party/abc123
            // Handle: https://www.birthdaybuddy.app/party/abc123

            if (path?.includes('party/')) {
                const partyId = path.split('party/')[1];
                return {
                    partyId,
                    inviterId: (queryParams?.inviter as string) || '',
                };
            }

            return null;
        } catch (error) {
            console.error('Failed to parse invite:', error);
            return null;
        }
    }

    /**
     * Generate shareable invite link
     */
    static generateInviteLink(partyId: string, userId: string): string {
        const domain = process.env.EXPO_PUBLIC_DEEP_LINK_DOMAIN || 'birthdaybuddy.app';
        return `https://${domain}/party/${partyId}?inviter=${userId}`;
    }

    /**
     * Generate custom scheme link
     */
    static generateDeepLink(partyId: string): string {
        return `birthdaybuddy://party/${partyId}`;
    }
}

/**
 * Hook to handle incoming deep links
 */
export const useDeepLinking = () => {
    const navigation = useNavigation<StackNavigationProp<any>>();

    useEffect(() => {
        // Handle initial URL (app opened from link)
        const handleInitialUrl = async () => {
            const initialUrl = await Linking.getInitialURL();

            if (initialUrl) {
                const invite = DeepLinkManager.parsePartyInvite(initialUrl);
                if (invite) {
                    navigation.navigate('PartyDetail', {
                        partyId: invite.partyId,
                        fromInvite: true,
                        inviterId: invite.inviterId
                    });
                }
            }
        };

        handleInitialUrl();

        // Handle URL when app is already open
        const subscription = Linking.addEventListener('url', (event: { url: string }) => {
            const invite = DeepLinkManager.parsePartyInvite(event.url);
            if (invite) {
                navigation.navigate('PartyDetail', {
                    partyId: invite.partyId,
                    fromInvite: true,
                    inviterId: invite.inviterId
                });
            }
        });

        return () => subscription.remove();
    }, [navigation]);
};
