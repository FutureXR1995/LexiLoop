/**
 * OfflineDashboard Component
 * Mobile dashboard for offline learning management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  IconButton,
  Chip,
  ProgressBar,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import { offlineLearningService, OfflineVocabulary, OfflineProgress } from '../services/OfflineLearningService';
import { theme } from '../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

interface OfflineDashboardProps {
  userId: string;
  onStartSession?: () => void;
  onSyncData?: () => void;
  onSettings?: () => void;
}

interface DashboardStats {
  totalWords: number;
  wordsForReview: number;
  masteredWords: number;
  averageMastery: number;
  streakDays: number;
  cacheSize: number;
  lastSyncTime: number;
  isOffline: boolean;
}

export const OfflineDashboard: React.FC<OfflineDashboardProps> = ({
  userId,
  onStartSession,
  onSyncData,
  onSettings,
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalWords: 0,
    wordsForReview: 0,
    masteredWords: 0,
    averageMastery: 0,
    streakDays: 0,
    cacheSize: 0,
    lastSyncTime: 0,
    isOffline: false,
  });
  const [recentWords, setRecentWords] = useState<OfflineVocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load statistics
      const [
        vocabularies,
        wordsForReview,
        cacheSize,
        lastSyncTime,
      ] = await Promise.all([
        offlineLearningService.getAllVocabularies(),
        offlineLearningService.getWordsForReview(userId, 50),
        offlineLearningService.getCacheSize(),
        offlineLearningService.getLastSyncTime(),
      ]);

      // Calculate statistics
      const totalWords = vocabularies.length;
      const masteredWords = vocabularies.filter(word => word.masteryLevel >= 80).length;
      const averageMastery = vocabularies.length > 0 
        ? vocabularies.reduce((sum, word) => sum + word.masteryLevel, 0) / vocabularies.length
        : 0;

      // Get recent words (last 5 studied)
      const recentWords = vocabularies
        .filter(word => word.lastReviewed)
        .sort((a, b) => (b.lastReviewed || 0) - (a.lastReviewed || 0))
        .slice(0, 5);

      setStats({
        totalWords,
        wordsForReview: wordsForReview.length,
        masteredWords,
        averageMastery,
        streakDays: calculateStreak(vocabularies),
        cacheSize,
        lastSyncTime,
        isOffline: offlineLearningService.isOfflineMode(),
      });

      setRecentWords(recentWords);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = (vocabularies: OfflineVocabulary[]): number => {
    // Simple streak calculation based on recent activity
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const dayStart = now - (i * oneDayMs);
      const dayEnd = dayStart + oneDayMs;
      
      const hasActivity = vocabularies.some(word => 
        word.lastReviewed && word.lastReviewed >= dayStart && word.lastReviewed < dayEnd
      );
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break; // Break streak if no activity
      }
    }
    
    return streak;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all offline vocabulary data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await offlineLearningService.clearCache();
              await loadDashboardData();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const formatCacheSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatLastSync = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getMasteryColor = (level: number): string => {
    if (level >= 80) return theme.colors.success;
    if (level >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Learning Dashboard</Text>
          <View style={styles.headerActions}>
            <Chip
              icon={stats.isOffline ? 'wifi-off' : 'wifi'}
              style={[
                styles.statusChip,
                { backgroundColor: stats.isOffline ? theme.colors.error : theme.colors.success },
              ]}
              textStyle={{ color: '#fff' }}
            >
              {stats.isOffline ? 'Offline' : 'Online'}
            </Chip>
            <IconButton icon="cog" size={24} onPress={onSettings} />
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsGrid}>
          <Animatable.View animation="fadeInUp" delay={100}>
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.statGradient}
              >
                <Icon name="library-books" size={32} color="#fff" />
                <Text style={styles.statNumber}>{stats.totalWords}</Text>
                <Text style={styles.statLabel}>Total Words</Text>
              </LinearGradient>
            </Card>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={200}>
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[theme.colors.warning, '#FFB74D']}
                style={styles.statGradient}
              >
                <Icon name="schedule" size={32} color="#fff" />
                <Text style={styles.statNumber}>{stats.wordsForReview}</Text>
                <Text style={styles.statLabel}>Due for Review</Text>
              </LinearGradient>
            </Card>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={300}>
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[theme.colors.success, '#66BB6A']}
                style={styles.statGradient}
              >
                <Icon name="check-circle" size={32} color="#fff" />
                <Text style={styles.statNumber}>{stats.masteredWords}</Text>
                <Text style={styles.statLabel}>Mastered</Text>
              </LinearGradient>
            </Card>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={400}>
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[theme.colors.error, '#EF5350']}
                style={styles.statGradient}
              >
                <Icon name="local-fire-department" size={32} color="#fff" />
                <Text style={styles.statNumber}>{stats.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </Card>
          </Animatable.View>
        </View>

        {/* Progress Overview */}
        <Animatable.View animation="fadeInUp" delay={500}>
          <Card style={styles.progressCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Learning Progress</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>
                  Average Mastery: {Math.round(stats.averageMastery)}%
                </Text>
                <ProgressBar
                  progress={stats.averageMastery / 100}
                  color={getMasteryColor(stats.averageMastery)}
                  style={styles.progressBar}
                />
              </View>
              <Text style={styles.progressInfo}>
                {stats.masteredWords} of {stats.totalWords} words mastered
              </Text>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Recent Words */}
        {recentWords.length > 0 && (
          <Animatable.View animation="fadeInUp" delay={600}>
            <Card style={styles.recentCard}>
              <Card.Content>
                <Text style={styles.cardTitle}>Recently Studied</Text>
                {recentWords.map((word, index) => (
                  <View key={word.id} style={styles.recentWordItem}>
                    <View style={styles.recentWordInfo}>
                      <Text style={styles.recentWordText}>{word.word}</Text>
                      <Text style={styles.recentWordMastery}>
                        {word.masteryLevel}% mastery
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.masteryDot,
                        { backgroundColor: getMasteryColor(word.masteryLevel) },
                      ]}
                    />
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Sync Status */}
        <Animatable.View animation="fadeInUp" delay={700}>
          <Card style={styles.syncCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Sync Status</Text>
              <View style={styles.syncInfo}>
                <View style={styles.syncItem}>
                  <Icon name="storage" size={20} color={theme.colors.secondary} />
                  <Text style={styles.syncText}>
                    Cache Size: {formatCacheSize(stats.cacheSize)}
                  </Text>
                </View>
                <View style={styles.syncItem}>
                  <Icon name="sync" size={20} color={theme.colors.secondary} />
                  <Text style={styles.syncText}>
                    Last Sync: {formatLastSync(stats.lastSyncTime)}
                  </Text>
                </View>
              </View>
              <View style={styles.syncActions}>
                <Button
                  mode="outlined"
                  onPress={handleClearCache}
                  style={styles.syncButton}
                >
                  Clear Cache
                </Button>
                <Button
                  mode="contained"
                  onPress={onSyncData}
                  disabled={stats.isOffline}
                  style={styles.syncButton}
                >
                  Sync Now
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="play-arrow"
        label={stats.wordsForReview > 0 ? `Review ${stats.wordsForReview}` : 'Start Learning'}
        style={styles.fab}
        onPress={onStartSession}
        disabled={stats.wordsForReview === 0}
      />
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    marginRight: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: (screenWidth - 48) / 2,
    marginBottom: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressInfo: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  recentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  recentWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  recentWordInfo: {
    flex: 1,
  },
  recentWordText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  recentWordMastery: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  masteryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  syncInfo: {
    marginBottom: 16,
  },
  syncItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  syncActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  syncButton: {
    flex: 1,
    marginHorizontal: 4,
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

export default OfflineDashboard;