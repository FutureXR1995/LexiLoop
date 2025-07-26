/**
 * Advanced Test Screen
 * Mobile interface for advanced testing modes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../store/ThemeContext';
import { ApiService } from '../../services/ApiService';
import { theme } from '../../utils/theme';

interface TestMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  estimatedTime: string;
}

interface ReviewStats {
  totalWords: number;
  reviewsToday: number;
  masteredWords: number;
  wordsToReview: number;
  overdueWords: number;
  masteryRate: number;
}

const AdvancedTestScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [testModes, setTestModes] = useState<TestMode[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [modesResponse, statsResponse] = await Promise.all([
        ApiService.get('/advanced-tests/modes'),
        ApiService.get('/advanced-tests/review/stats'),
      ]);

      if (modesResponse.success) {
        setTestModes(modesResponse.data);
      }

      if (statsResponse.success) {
        setReviewStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testMode: TestMode) => {
    try {
      // For demo, use sample vocabulary IDs
      const sampleVocabIds = ['vocab1', 'vocab2', 'vocab3'];
      
      const response = await ApiService.post('/advanced-tests/create', {
        testMode: testMode.id,
        vocabularyIds: sampleVocabIds,
        settings: {
          questionCount: 20,
          enableHints: true,
          enableExplanations: true,
        },
      });

      if (response.success) {
        // Navigate to test screen
        // navigation.navigate('Test', { sessionId: response.data.id });
        Alert.alert('Success', `Starting ${testMode.name}...`);
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      Alert.alert('Error', 'Failed to start test');
    }
  };

  const startReviewSession = async () => {
    try {
      const response = await ApiService.get('/advanced-tests/review/due?limit=20');
      
      if (response.success && response.data.dueWords.length > 0) {
        // Navigate to review screen
        Alert.alert('Success', `Starting review with ${response.data.dueWords.length} words...`);
      } else {
        Alert.alert('Info', 'No words are due for review right now!');
      }
    } catch (error) {
      console.error('Failed to start review:', error);
      Alert.alert('Error', 'Failed to start review session');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'high': return colors.error;
      case 'expert': return colors.secondary;
      case 'adaptive': return colors.primary;
      case 'dynamic': return colors.info;
      default: return colors.text.secondary;
    }
  };

  const getIconName = (iconEmoji: string) => {
    const iconMap: { [key: string]: string } = {
      '🧠': 'psychology',
      '🎯': 'my-location',
      '⚡': 'flash-on',
      '📚': 'menu-book',
      '🎪': 'center-focus-strong',
      '🔄': 'refresh',
      '🏆': 'emoji-events',
    };
    return iconMap[iconEmoji] || 'help';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text.primary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Advanced Testing
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Intelligent testing and spaced repetition
          </Text>
        </View>

        {/* Stats Summary */}
        {reviewStats && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Icon name="book" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text.primary }]}>
                {reviewStats.totalWords}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Total Words
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Icon name="check-circle" size={24} color={colors.success} />
              <Text style={[styles.statNumber, { color: colors.text.primary }]}>
                {reviewStats.masteredWords}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Mastered
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Icon name="schedule" size={24} color={colors.warning} />
              <Text style={[styles.statNumber, { color: colors.text.primary }]}>
                {reviewStats.wordsToReview}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Due Today
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Icon name="error" size={24} color={colors.error} />
              <Text style={[styles.statNumber, { color: colors.text.primary }]}>
                {reviewStats.overdueWords}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Overdue
              </Text>
            </View>
          </View>
        )}

        {/* Review Section */}
        {reviewStats && reviewStats.wordsToReview > 0 && (
          <View style={[styles.reviewSection, { backgroundColor: colors.surface }]}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={[styles.reviewTitle, { color: colors.text.primary }]}>
                  Spaced Repetition Review
                </Text>
                <Text style={[styles.reviewSubtitle, { color: colors.text.secondary }]}>
                  {reviewStats.wordsToReview} words ready for review
                </Text>
              </View>
              <Icon name="refresh" size={24} color={colors.primary} />
            </View>
            
            <TouchableOpacity
              style={[styles.reviewButton, { backgroundColor: colors.primary }]}
              onPress={startReviewSession}
            >
              <Icon name="play-arrow" size={20} color="white" />
              <Text style={styles.reviewButtonText}>Start Review Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Test Modes */}
        <View style={styles.testModesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Test Modes
          </Text>
          
          <View style={styles.testModeGrid}>
            {testModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.testModeCard, { backgroundColor: colors.surface }]}
                onPress={() => startTest(mode)}
              >
                <View style={styles.testModeHeader}>
                  <Icon 
                    name={getIconName(mode.icon)} 
                    size={28} 
                    color={colors.primary} 
                  />
                  <View style={styles.testModeInfo}>
                    <Text style={[styles.testModeName, { color: colors.text.primary }]}>
                      {mode.name}
                    </Text>
                    <View style={styles.testModeTags}>
                      <View style={[
                        styles.difficultyTag,
                        { backgroundColor: `${getDifficultyColor(mode.difficulty)}20` }
                      ]}>
                        <Text style={[
                          styles.difficultyText,
                          { color: getDifficultyColor(mode.difficulty) }
                        ]}>
                          {mode.difficulty}
                        </Text>
                      </View>
                      <Text style={[styles.timeText, { color: colors.text.light }]}>
                        {mode.estimatedTime}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Text style={[styles.testModeDescription, { color: colors.text.secondary }]}>
                  {mode.description}
                </Text>
                
                <View style={styles.testModeFooter}>
                  <Icon name="play-arrow" size={18} color={colors.primary} />
                  <Text style={[styles.startText, { color: colors.primary }]}>
                    Start Test
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    width: '48%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  reviewSection: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  reviewSubtitle: {
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testModesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
  },
  testModeGrid: {
    gap: theme.spacing.md,
  },
  testModeCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  testModeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  testModeInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  testModeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  testModeTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  difficultyTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
  },
  testModeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  testModeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  startText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AdvancedTestScreen;