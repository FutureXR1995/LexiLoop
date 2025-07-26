/**
 * HomeScreen Component
 * Main home screen with offline dashboard
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import OfflineDashboard from '../../components/OfflineDashboard';
import LearningSession from '../../components/LearningSession';
import { useAuth } from '../../store/AuthContext';
import { offlineLearningService } from '../../services/OfflineLearningService';
import { theme } from '../../utils/theme';

interface SessionStats {
  totalWords: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  wordsLearned: string[];
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [showLearningSession, setShowLearningSession] = useState(false);

  const handleStartSession = useCallback(() => {
    setShowLearningSession(true);
  }, []);

  const handleSessionComplete = useCallback((stats: SessionStats) => {
    console.log('Session completed:', stats);
    setShowLearningSession(false);
  }, []);

  const handleExitSession = useCallback(() => {
    setShowLearningSession(false);
  }, []);

  const handleSyncData = useCallback(async () => {
    try {
      await offlineLearningService.syncOfflineData();
      console.log('Data sync completed');
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }, []);

  const handleSettings = useCallback(() => {
    navigation.navigate('Profile' as never);
  }, [navigation]);

  if (showLearningSession) {
    return (
      <LearningSession
        userId={user?.id || 'guest'}
        sessionSize={10}
        onSessionComplete={handleSessionComplete}
        onExit={handleExitSession}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineDashboard
        userId={user?.id || 'guest'}
        onStartSession={handleStartSession}
        onSyncData={handleSyncData}
        onSettings={handleSettings}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default HomeScreen;