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

    /**
     * Parse password reset deep link
     */
    static parsePasswordReset(url: string): boolean {
        try {
            console.log('🔍 Parsing password reset URL:', url);
            const parsed = Linking.parse(url);
            console.log('📋 Parsed URL:', JSON.stringify(parsed, null, 2));
            const path = parsed.path;
            const hostname = parsed.hostname;
            const queryParams = parsed.queryParams;

            // Supabase sends URLs like:
            // com.satyam.birthdaybuddy://reset-password#access_token=xxx&type=recovery
            // OR
            // com.satyam.birthdaybuddy://reset-password?access_token=xxx&type=recovery

            // Check if URL contains reset-password in path or hostname
            const hasResetPasswordPath = path?.includes('reset-password') || hostname?.includes('reset-password');

            // Check if it's a recovery type (Supabase adds type=recovery for password reset)
            const isRecoveryType = queryParams?.type === 'recovery' || url.includes('type=recovery');

            const isResetPassword = hasResetPasswordPath || isRecoveryType;
            console.log('✅ Is password reset?', isResetPassword, '(path:', hasResetPasswordPath, ', recovery:', isRecoveryType, ')');

            if (isResetPassword) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to parse reset password link:', error);
            return false;
        }
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
            console.log('🚀 Initial URL:', initialUrl);

            if (initialUrl) {
                // Check for password reset
                if (DeepLinkManager.parsePasswordReset(initialUrl)) {
                    console.log('🔐 Navigating to PasswordReset screen...');
                    // Use setTimeout to ensure navigation is ready
                    setTimeout(() => {
                        navigation.navigate('PasswordReset');
                    }, 100);
                    return;
                }

                // Check for party invite
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
            console.log('📱 URL event received:', event.url);

            // Check for password reset
            if (DeepLinkManager.parsePasswordReset(event.url)) {
                console.log('🔐 Navigating to PasswordReset screen...');
                navigation.navigate('PasswordReset');
                return;
            }

            // Check for party invite
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
