/**
 * Notification Service
 * Handles push notifications and local notifications
 */

import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  message: string;
  data?: any;
  scheduledTime?: Date;
  repeatType?: 'day' | 'week' | 'month';
}

class NotificationServiceClass {
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    // Configure push notifications
    PushNotification.configure({
      onRegister: (token) => {
        console.log('FCM Token:', token);
        // Send token to backend for push notifications
        this.sendTokenToBackend(token.token);
      },

      onNotification: (notification) => {
        console.log('Notification received:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
        }
      },

      onAction: (notification) => {
        console.log('Notification action:', notification);
      },

      onRegistrationError: (err) => {
        console.error('FCM registration error:', err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      this.createNotificationChannels();
    }

    this.initialized = true;
  }

  private createNotificationChannels() {
    // Daily reminder channel
    PushNotification.createChannel(
      {
        channelId: 'daily-reminder',
        channelName: 'Daily Learning Reminders',
        channelDescription: 'Notifications to remind you to practice vocabulary',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log('Daily reminder channel created:', created)
    );

    // Achievement channel
    PushNotification.createChannel(
      {
        channelId: 'achievements',
        channelName: 'Achievements',
        channelDescription: 'Notifications for earned achievements and milestones',
        importance: Importance.DEFAULT,
        vibrate: true,
      },
      (created) => console.log('Achievement channel created:', created)
    );

    // Social channel
    PushNotification.createChannel(
      {
        channelId: 'social',
        channelName: 'Social Updates',
        channelDescription: 'Friend requests and social interactions',
        importance: Importance.DEFAULT,
        vibrate: false,
      },
      (created) => console.log('Social channel created:', created)
    );
  }

  private async sendTokenToBackend(token: string) {
    try {
      // Send FCM token to backend for push notifications
      // This would be implemented when push notification backend is ready
      console.log('TODO: Send FCM token to backend:', token);
    } catch (error) {
      console.error('Failed to send FCM token:', error);
    }
  }

  private handleNotificationTap(notification: any) {
    // Handle navigation based on notification data
    const { type, data } = notification.data || {};
    
    switch (type) {
      case 'achievement':
        // Navigate to achievements screen
        break;
      case 'friend_request':
        // Navigate to social screen
        break;
      case 'daily_reminder':
        // Navigate to learning screen
        break;
      default:
        // Navigate to home screen
        break;
    }
  }

  // Schedule daily learning reminder
  scheduleDailyReminder(time: Date = new Date(9, 0, 0)) {
    PushNotification.localNotificationSchedule({
      channelId: 'daily-reminder',
      title: '📚 Time to Learn!',
      message: 'Keep your streak going! Practice vocabulary for just 10 minutes.',
      date: time,
      repeatType: 'day',
      actions: ['Study Now', 'Remind Later'],
      userInfo: { type: 'daily_reminder' },
    });
  }

  // Cancel daily reminders
  cancelDailyReminder() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Show achievement notification
  showAchievementNotification(achievementTitle: string, description: string) {
    PushNotification.localNotification({
      channelId: 'achievements',
      title: `🏆 Achievement Unlocked!`,
      message: `${achievementTitle}: ${description}`,
      playSound: true,
      soundName: 'achievement.mp3',
      userInfo: { type: 'achievement' },
    });
  }

  // Show friend request notification
  showFriendRequestNotification(username: string) {
    PushNotification.localNotification({
      channelId: 'social',
      title: '🤝 New Friend Request',
      message: `${username} wants to be your friend!`,
      actions: ['Accept', 'View'],
      userInfo: { type: 'friend_request' },
    });
  }

  // Show streak milestone notification
  showStreakNotification(streakDays: number) {
    const emoji = streakDays >= 30 ? '🔥' : streakDays >= 7 ? '⚡' : '✨';
    
    PushNotification.localNotification({
      channelId: 'achievements',
      title: `${emoji} ${streakDays} Day Streak!`,
      message: `Amazing! You've been learning for ${streakDays} days straight!`,
      playSound: true,
      userInfo: { type: 'streak_milestone' },
    });
  }

  // Show level up notification
  showLevelUpNotification(newLevel: number) {
    PushNotification.localNotification({
      channelId: 'achievements',
      title: '📈 Level Up!',
      message: `Congratulations! You've reached level ${newLevel}!`,
      playSound: true,
      soundName: 'levelup.mp3',
      userInfo: { type: 'level_up' },
    });
  }

  // Custom local notification
  showNotification({ title, message, data, scheduledTime }: NotificationData) {
    const notification = {
      channelId: 'daily-reminder',
      title,
      message,
      playSound: true,
      userInfo: data,
    };

    if (scheduledTime) {
      PushNotification.localNotificationSchedule({
        ...notification,
        date: scheduledTime,
      });
    } else {
      PushNotification.localNotification(notification);
    }
  }

  // Check notification permissions
  checkPermissions(): Promise<any> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions(resolve);
    });
  }

  // Request notification permissions (iOS)
  requestPermissions(): Promise<any> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions().then(resolve);
    });
  }

  // Get delivered notifications
  getDeliveredNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getDeliveredNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }

  // Clear all notifications
  clearAllNotifications() {
    PushNotification.removeAllDeliveredNotifications();
  }
}

export const NotificationService = new NotificationServiceClass();