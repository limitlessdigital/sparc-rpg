// Push Notification Service
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'sparc_push_token';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushRegistration {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Device.expoConfig?.extra?.eas?.projectId,
    });
    
    const token = tokenData.data;
    
    // Store locally
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SPARC Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8b5cf6',
      });

      await Notifications.setNotificationChannelAsync('turn-alerts', {
        name: 'Turn Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#22c55e',
      });

      await Notifications.setNotificationChannelAsync('session-reminders', {
        name: 'Session Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#8b5cf6',
      });
    }

    return token;
  } catch (error) {
    console.error('Failed to register for push notifications:', error);
    return null;
  }
}

export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

export async function unregisterPushNotifications(): Promise<void> {
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  // TODO: Call API to unregister device
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Schedule a local notification (for testing)
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  seconds = 1
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: { seconds },
  });
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get the number of badge count
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}
