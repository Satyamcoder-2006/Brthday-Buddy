import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Birthday Buddy",
    slug: "birthday-buddy",
    scheme: "birthdaybuddy",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#000000"
    },
    updates: {
        fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
        "**/*"
    ],
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.yourcompany.birthdaybuddy",
        infoPlist: {
            "NSCalendarsUsageDescription": "This app needs access to your calendar to mark birthdays.",
            "NSRemindersUsageDescription": "This app needs access to reminders for birthday notifications.",
            "NSCameraUsageDescription": "Upload birthday photos from camera.",
            "NSPhotoLibraryUsageDescription": "Upload birthday photos from library."
        }
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#000000"
        },
        package: "com.yourcompany.birthdaybuddy",
        permissions: [
            "RECEIVE_BOOT_COMPLETED",
            "SCHEDULE_EXACT_ALARM",
            "POST_NOTIFICATIONS",
            "READ_CALENDAR",
            "WRITE_CALENDAR",
            "CAMERA",
            "READ_MEDIA_IMAGES",
            "READ_MEDIA_VIDEO",
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.WRITE_EXTERNAL_STORAGE",
            "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
            "android.permission.READ_MEDIA_IMAGES",
            "android.permission.READ_MEDIA_VIDEO",
            "android.permission.READ_MEDIA_AUDIO"
        ]
    },
    plugins: [
        [
            "expo-notifications",
            {
                "color": "#FF9500"
            }
        ],
        [
            "expo-media-library",
            {
                "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
                "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
                "isImageOnly": true
            }
        ],
        [
            "expo-build-properties",
            {
                "android": {
                    "minSdkVersion": 24,
                    "compileSdkVersion": 35,
                    "targetSdkVersion": 35
                }
            }
        ],
        "@react-native-community/datetimepicker",
        [
            "react-native-android-widget",
            {
                "widgets": [
                    {
                        "name": "BirthdayWidget",
                        "label": "Next Birthday",
                        "minWidth": "3x2",
                        "minHeight": "2x1",
                        "description": "Shows the next upcoming birthday",
                        "previewImage": "./assets/widget-preview.png",
                        "targetCellWidth": 3,
                        "targetCellHeight": 2,
                        "updatePeriodMillis": 1800000
                    }
                ]
            }
        ]
    ],
    extra: {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
        eas: {
            projectId: "92e43b74-800b-4cf6-b2ff-85521bc050a7"
        }
    }
});
