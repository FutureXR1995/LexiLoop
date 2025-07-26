/**
 * LearningSession Component
 * Mobile-optimized learning session with spaced repetition
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  BackHandler,
  Alert,
} from 'react-native';
import { Card, Text, Button, ProgressBar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

import VocabularyCard from './VocabularyCard';
import { offlineLearningService, OfflineVocabulary } from '../services/OfflineLearningService';
import { theme } from '../utils/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LearningSessionProps {
  userId: string;
  sessionSize?: number;
  onSessionComplete?: (stats: SessionStats) => void;
  onExit?: () => void;
}

interface SessionStats {
  totalWords: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  wordsLearned: string[];
}

export const LearningSession: React.FC<LearningSessionProps> = ({
  userId,
  sessionSize = 10,
  onSessionComplete,
  onExit,
}) => {
  const [words, setWords] = useState<OfflineVocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalWords: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeSpent: 0,
    wordsLearned: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  // Load words for review
  useEffect(() => {
    loadWordsForReview();
  }, [userId, sessionSize]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  const loadWordsForReview = async () => {
    try {
      setIsLoading(true);
      const reviewWords = await offlineLearningService.getWordsForReview(userId, sessionSize);
      
      if (reviewWords.length === 0) {
        Alert.alert(
          'No Words Available',
          'All words have been reviewed recently. Come back later for more practice!',
          [{ text: 'OK', onPress: onExit }]
        );
        return;
      }

      setWords(reviewWords);
      setSessionStats(prev => ({ ...prev, totalWords: reviewWords.length }));
    } catch (error) {
      console.error('Failed to load words for review:', error);
      Alert.alert('Error', 'Failed to load words for practice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = useCallback(() => {
    Alert.alert(
      'Exit Session',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'Exit', onPress: handleExit },
      ]
    );
    return true;
  }, []);

  const handleExit = useCallback(() => {
    const timeSpent = Date.now() - sessionStartTime;
    const finalStats = { ...sessionStats, timeSpent };
    
    if (onSessionComplete) {
      onSessionComplete(finalStats);
    }
    
    if (onExit) {
      onExit();
    }
  }, [sessionStats, sessionStartTime, onSessionComplete, onExit]);

  const handleMasteryUpdate = useCallback((wordId: string, correct: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: !correct ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
      wordsLearned: correct ? [...prev.wordsLearned, wordId] : prev.wordsLearned,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Session complete
      setIsComplete(true);
      const timeSpent = Date.now() - sessionStartTime;
      const finalStats = { ...sessionStats, timeSpent };
      
      setTimeout(() => {
        if (onSessionComplete) {
          onSessionComplete(finalStats);
        }
      }, 2000);
    }
  }, [currentIndex, words.length, sessionStats, sessionStartTime, onSessionComplete]);

  const getProgressPercentage = () => {
    if (words.length === 0) return 0;
    return ((currentIndex + 1) / words.length) * 100;
  };

  const getAccuracyPercentage = () => {
    const totalAnswered = sessionStats.correctAnswers + sessionStats.incorrectAnswers;
    if (totalAnswered === 0) return 0;
    return (sessionStats.correctAnswers / totalAnswered) * 100;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your practice session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <Animatable.View
          animation="bounceIn"
          style={styles.completionContainer}
        >
          <Card style={styles.completionCard}>
            <Card.Content>
              <Text style={styles.completionTitle}>🎉 Session Complete!</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{sessionStats.totalWords}</Text>
                  <Text style={styles.statLabel}>Words Practiced</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                    {Math.round(getAccuracyPercentage())}%
                  </Text>
                  <Text style={styles.statLabel}>Accuracy</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round((Date.now() - sessionStartTime) / 60000)}m
                  </Text>
                  <Text style={styles.statLabel}>Time Spent</Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleExit}
                style={styles.finishButton}
                contentStyle={styles.finishButtonContent}
              >
                Finish Session
              </Button>
            </Card.Content>
          </Card>
        </Animatable.View>
      </SafeAreaView>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBackPress}
        />
        
        <View style={styles.headerCenter}>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {words.length}
          </Text>
          <ProgressBar
            progress={getProgressPercentage() / 100}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.accuracyText}>
            {Math.round(getAccuracyPercentage())}%
          </Text>
        </View>
      </View>

      {/* Current Word */}
      <View style={styles.cardContainer}>
        <Animatable.View
          key={currentIndex}
          animation="slideInRight"
          duration={300}
        >
          <VocabularyCard
            vocabulary={currentWord}
            userId={userId}
            onMasteryUpdate={handleMasteryUpdate}
            onNext={handleNext}
          />
        </Animatable.View>
      </View>

      {/* Session Stats Footer */}
      <View style={styles.footer}>
        <View style={styles.footerStats}>
          <View style={styles.footerStat}>
            <Text style={[styles.footerStatNumber, { color: theme.colors.success }]}>
              {sessionStats.correctAnswers}
            </Text>
            <Text style={styles.footerStatLabel}>Correct</Text>
          </View>
          
          <View style={styles.footerStat}>
            <Text style={[styles.footerStatNumber, { color: theme.colors.error }]}>
              {sessionStats.incorrectAnswers}
            </Text>
            <Text style={styles.footerStatLabel}>Incorrect</Text>
          </View>
          
          <View style={styles.footerStat}>
            <Text style={styles.footerStatNumber}>
              {words.length - currentIndex - 1}
            </Text>
            <Text style={styles.footerStatLabel}>Remaining</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.onBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  footer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerStat: {
    alignItems: 'center',
  },
  footerStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  footerStatLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  completionCard: {
    borderRadius: 16,
    elevation: 8,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: 8,
  },
  finishButton: {
    marginTop: 16,
  },
  finishButtonContent: {
    paddingVertical: 8,
  },
});

export default LearningSession;