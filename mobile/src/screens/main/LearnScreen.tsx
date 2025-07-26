/**
 * LearnScreen Component
 * Learning session management screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ProgressBar,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

import LearningSession from '../../components/LearningSession';
import { useAuth } from '../../store/AuthContext';
import { offlineLearningService, OfflineVocabulary } from '../../services/OfflineLearningService';
import { theme } from '../../utils/theme';

interface LearningStats {
  totalWords: number;
  wordsForReview: number;
  newWords: number;
  reviewingWords: number;
  masteredWords: number;
}

interface SessionStats {
  totalWords: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  wordsLearned: string[];
}

const LearnScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LearningStats>({
    totalWords: 0,
    wordsForReview: 0,
    newWords: 0,
    reviewingWords: 0,
    masteredWords: 0,
  });
  const [showLearningSession, setShowLearningSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLearningStats();
  }, []);

  const loadLearningStats = async () => {
    try {
      setIsLoading(true);
      
      const [vocabularies, wordsForReview] = await Promise.all([
        offlineLearningService.getAllVocabularies(),
        offlineLearningService.getWordsForReview(user?.id || 'guest', 100),
      ]);

      const newWords = vocabularies.filter(word => word.reviewCount === 0).length;
      const reviewingWords = vocabularies.filter(
        word => word.reviewCount > 0 && word.masteryLevel < 80
      ).length;
      const masteredWords = vocabularies.filter(word => word.masteryLevel >= 80).length;

      setStats({
        totalWords: vocabularies.length,
        wordsForReview: wordsForReview.length,
        newWords,
        reviewingWords,
        masteredWords,
      });
    } catch (error) {
      console.error('Failed to load learning stats:', error);
      Alert.alert('Error', 'Failed to load learning statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLearningStats();
    setIsRefreshing(false);
  };

  const handleStartSession = useCallback((sessionType: 'review' | 'new' | 'mixed') => {
    setShowLearningSession(true);
  }, []);

  const handleSessionComplete = useCallback((sessionStats: SessionStats) => {
    console.log('Session completed:', sessionStats);
    setShowLearningSession(false);
    loadLearningStats(); // Refresh stats after session
  }, []);

  const handleExitSession = useCallback(() => {
    setShowLearningSession(false);
  }, []);

  if (showLearningSession) {
    return (
      <LearningSession
        userId={user?.id || 'guest'}
        sessionSize={15}
        onSessionComplete={handleSessionComplete}
        onExit={handleExitSession}
      />
    );
  }

  const getProgressPercentage = () => {
    if (stats.totalWords === 0) return 0;
    return (stats.masteredWords / stats.totalWords) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learning Center</Text>
          <Text style={styles.headerSubtitle}>Continue your vocabulary journey</Text>
        </View>

        {/* Progress Overview */}
        <Animatable.View animation="fadeInUp" delay={100}>
          <Card style={styles.progressCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Overall Progress</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressNumber}>
                    {Math.round(getProgressPercentage())}%
                  </Text>
                  <Text style={styles.progressLabel}>Mastered</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={getProgressPercentage() / 100}
                    color={theme.colors.success}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressText}>
                    {stats.masteredWords} of {stats.totalWords} words
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Learning Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Learning Categories</Text>
          
          <Animatable.View animation="fadeInUp" delay={200}>
            <Card style={styles.categoryCard}>
              <Card.Content>
                <View style={styles.categoryHeader}>
                  <Icon name="schedule" size={24} color={theme.colors.warning} />
                  <Text style={styles.categoryTitle}>Review Due</Text>
                  <Chip
                    style={[styles.categoryChip, { backgroundColor: theme.colors.warning }]}
                    textStyle={{ color: '#fff' }}
                  >
                    {stats.wordsForReview}
                  </Chip>
                </View>
                <Text style={styles.categoryDescription}>
                  Words that need review based on spaced repetition
                </Text>
                <Button
                  mode="contained"
                  onPress={() => handleStartSession('review')}
                  disabled={stats.wordsForReview === 0}
                  style={styles.categoryButton}
                  buttonColor={theme.colors.warning}
                >
                  Start Review Session
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={300}>
            <Card style={styles.categoryCard}>
              <Card.Content>
                <View style={styles.categoryHeader}>
                  <Icon name="fiber-new" size={24} color={theme.colors.info} />
                  <Text style={styles.categoryTitle}>New Words</Text>
                  <Chip
                    style={[styles.categoryChip, { backgroundColor: theme.colors.info }]}
                    textStyle={{ color: '#fff' }}
                  >
                    {stats.newWords}
                  </Chip>
                </View>
                <Text style={styles.categoryDescription}>
                  Fresh vocabulary waiting to be learned
                </Text>
                <Button
                  mode="contained"
                  onPress={() => handleStartSession('new')}
                  disabled={stats.newWords === 0}
                  style={styles.categoryButton}
                  buttonColor={theme.colors.info}
                >
                  Learn New Words
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={400}>
            <Card style={styles.categoryCard}>
              <Card.Content>
                <View style={styles.categoryHeader}>
                  <Icon name="shuffle" size={24} color={theme.colors.primary} />
                  <Text style={styles.categoryTitle}>Mixed Practice</Text>
                  <Chip
                    style={[styles.categoryChip, { backgroundColor: theme.colors.primary }]}
                    textStyle={{ color: '#fff' }}
                  >
                    {stats.reviewingWords}
                  </Chip>
                </View>
                <Text style={styles.categoryDescription}>
                  Combination of review and new words for balanced learning
                </Text>
                <Button
                  mode="contained"
                  onPress={() => handleStartSession('mixed')}
                  disabled={stats.totalWords === 0}
                  style={styles.categoryButton}
                >
                  Mixed Session
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>
        </View>

        {/* Quick Stats */}
        <Animatable.View animation="fadeInUp" delay={500}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Quick Stats</Text>
              <View style={styles.quickStats}>
                <View style={styles.quickStat}>
                  <Icon name="library-books" size={20} color={theme.colors.primary} />
                  <Text style={styles.quickStatNumber}>{stats.totalWords}</Text>
                  <Text style={styles.quickStatLabel}>Total Words</Text>
                </View>
                <View style={styles.quickStat}>
                  <Icon name="trending-up" size={20} color={theme.colors.warning} />
                  <Text style={styles.quickStatNumber}>{stats.reviewingWords}</Text>
                  <Text style={styles.quickStatLabel}>In Progress</Text>
                </View>
                <View style={styles.quickStat}>
                  <Icon name="check-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.quickStatNumber}>{stats.masteredWords}</Text>
                  <Text style={styles.quickStatLabel}>Mastered</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Quick Start FAB */}
      <FAB
        icon="play-arrow"
        label="Quick Start"
        style={styles.fab}
        onPress={() => handleStartSession('mixed')}
        disabled={stats.totalWords === 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressInfo: {
    alignItems: 'center',
    marginRight: 20,
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    flex: 1,
    marginLeft: 12,
  },
  categoryChip: {
    height: 24,
  },
  categoryDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  categoryButton: {
    marginTop: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default LearnScreen;