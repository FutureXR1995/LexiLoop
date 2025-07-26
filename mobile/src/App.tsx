/**
 * LexiLoop Mobile App
 * Main App Component
 */

import React, { useEffect } from 'react';
import { StatusBar, Platform, PermissionsAndroid, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Orientation from 'react-native-orientation-locker';

import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { ApiProvider } from './store/ApiContext';
import { NotificationService } from './services/NotificationService';
import { theme } from './utils/theme';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize app services
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Lock orientation to portrait for better UX
    Orientation.lockToPortrait();

    // Request permissions
    if (Platform.OS === 'android') {
      await requestAndroidPermissions();
    }

    // Initialize notifications
    NotificationService.initialize();

    // Set up app state change listener
    AppState.addEventListener('change', handleAppStateChange);

    // Set up background sync
    // BackgroundSync.initialize();
  };

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      // App has come to foreground - sync data if needed
      console.log('App is active - syncing data');
    } else if (nextAppState === 'background') {
      // App has gone to background - save state
      console.log('App is in background - saving state');
    }
  };

  const requestAndroidPermissions = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
    } catch (error) {
      console.warn('Permission request failed:', error);
    }
  };

  const paperTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      accent: theme.colors.secondary,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider>
            <AuthProvider>
              <ApiProvider>
                <NavigationContainer>
                  <StatusBar
                    barStyle="dark-content"
                    backgroundColor={theme.colors.background}
                  />
                  <AppNavigator />
                </NavigationContainer>
              </ApiProvider>
            </AuthProvider>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;