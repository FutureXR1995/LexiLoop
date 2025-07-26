/**
 * Offline Learning Service
 * Handles offline vocabulary learning capabilities
 */

import { MMKV } from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize MMKV for fast storage
const storage = new MMKV();

export interface OfflineVocabulary {
  id: string;
  word: string;
  definition: string;
  exampleSentence?: string;
  pronunciation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  audioPath?: string;
  imageUrl?: string;
  lastReviewed?: number;
  masteryLevel: number;
  reviewCount: number;
}

export interface OfflineProgress {
  userId: string;
  wordId: string;
  correct: number;
  incorrect: number;
  lastAttempt: number;
  streak: number;
  nextReview: number;
}

export interface SyncData {
  vocabularies: OfflineVocabulary[];
  progress: OfflineProgress[];
  lastSyncTime: number;
}

class OfflineLearningService {
  private isOnline: boolean = true;
  private syncQueue: any[] = [];
  private syncTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Monitor network status
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      console.log(`Network status: ${this.isOnline ? 'Online' : 'Offline'}`);
      
      // If we just came back online, sync data
      if (wasOffline && this.isOnline) {
        this.syncOfflineData();
      }
    });

    // Start periodic sync
    this.startPeriodicSync();
  }

  /**
   * Vocabulary Management
   */
  async saveVocabulary(vocabulary: OfflineVocabulary): Promise<void> {
    try {
      const key = `vocab_${vocabulary.id}`;
      storage.set(key, JSON.stringify(vocabulary));
      
      // Add to vocabulary index
      await this.updateVocabularyIndex(vocabulary.id, 'add');
      
      console.log(`Vocabulary saved offline: ${vocabulary.word}`);
    } catch (error) {
      console.error('Failed to save vocabulary offline:', error);
      throw error;
    }
  }

  async getVocabulary(id: string): Promise<OfflineVocabulary | null> {
    try {
      const key = `vocab_${id}`;
      const data = storage.getString(key);
      
      if (data) {
        return JSON.parse(data) as OfflineVocabulary;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get vocabulary:', error);
      return null;
    }
  }

  async getAllVocabularies(): Promise<OfflineVocabulary[]> {
    try {
      const index = await this.getVocabularyIndex();
      const vocabularies: OfflineVocabulary[] = [];
      
      for (const id of index) {
        const vocab = await this.getVocabulary(id);
        if (vocab) {
          vocabularies.push(vocab);
        }
      }
      
      return vocabularies;
    } catch (error) {
      console.error('Failed to get all vocabularies:', error);
      return [];
    }
  }

  async deleteVocabulary(id: string): Promise<void> {
    try {
      const key = `vocab_${id}`;
      storage.delete(key);
      
      // Remove from vocabulary index
      await this.updateVocabularyIndex(id, 'remove');
      
      console.log(`Vocabulary deleted: ${id}`);
    } catch (error) {
      console.error('Failed to delete vocabulary:', error);
      throw error;
    }
  }

  private async getVocabularyIndex(): Promise<string[]> {
    try {
      const index = await AsyncStorage.getItem('vocabulary_index');
      return index ? JSON.parse(index) : [];
    } catch (error) {
      console.error('Failed to get vocabulary index:', error);
      return [];
    }
  }

  private async updateVocabularyIndex(id: string, action: 'add' | 'remove'): Promise<void> {
    try {
      let index = await this.getVocabularyIndex();
      
      if (action === 'add' && !index.includes(id)) {
        index.push(id);
      } else if (action === 'remove') {
        index = index.filter(vocabId => vocabId !== id);
      }
      
      await AsyncStorage.setItem('vocabulary_index', JSON.stringify(index));
    } catch (error) {
      console.error('Failed to update vocabulary index:', error);
    }
  }

  /**
   * Progress Management
   */
  async saveProgress(progress: OfflineProgress): Promise<void> {
    try {
      const key = `progress_${progress.userId}_${progress.wordId}`;
      storage.set(key, JSON.stringify(progress));
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        this.addToSyncQueue('progress', progress);
      }
      
      console.log(`Progress saved: ${progress.wordId}`);
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  }

  async getProgress(userId: string, wordId: string): Promise<OfflineProgress | null> {
    try {
      const key = `progress_${userId}_${wordId}`;
      const data = storage.getString(key);
      
      if (data) {
        return JSON.parse(data) as OfflineProgress;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  }

  async getAllProgress(userId: string): Promise<OfflineProgress[]> {
    try {
      const vocabularies = await this.getAllVocabularies();
      const progressList: OfflineProgress[] = [];
      
      for (const vocab of vocabularies) {
        const progress = await this.getProgress(userId, vocab.id);
        if (progress) {
          progressList.push(progress);
        }
      }
      
      return progressList;
    } catch (error) {
      console.error('Failed to get all progress:', error);
      return [];
    }
  }

  /**
   * Spaced Repetition Algorithm
   */
  async getWordsForReview(userId: string, limit: number = 10): Promise<OfflineVocabulary[]> {
    try {
      const vocabularies = await this.getAllVocabularies();
      const now = Date.now();
      const wordsForReview: { vocab: OfflineVocabulary; priority: number }[] = [];
      
      for (const vocab of vocabularies) {
        const progress = await this.getProgress(userId, vocab.id);
        
        // Calculate review priority
        let priority = 0;
        
        if (!progress) {
          // New word - highest priority
          priority = 1000;
        } else if (progress.nextReview <= now) {
          // Due for review
          priority = 500 - progress.masteryLevel;
        } else {
          // Not due yet
          continue;
        }
        
        wordsForReview.push({ vocab, priority });
      }
      
      // Sort by priority and return top words
      wordsForReview.sort((a, b) => b.priority - a.priority);
      return wordsForReview.slice(0, limit).map(item => item.vocab);
    } catch (error) {
      console.error('Failed to get words for review:', error);
      return [];
    }
  }

  async updateWordMastery(userId: string, wordId: string, correct: boolean): Promise<void> {
    try {
      let progress = await this.getProgress(userId, wordId);
      
      if (!progress) {
        // Create new progress record
        progress = {
          userId,
          wordId,
          correct: 0,
          incorrect: 0,
          lastAttempt: Date.now(),
          streak: 0,
          nextReview: Date.now() + (1000 * 60 * 60 * 24), // 1 day
        };
      }
      
      // Update progress
      if (correct) {
        progress.correct++;
        progress.streak++;
        
        // Increase review interval based on streak
        const intervals = [1, 3, 7, 14, 30, 90]; // days
        const intervalIndex = Math.min(progress.streak - 1, intervals.length - 1);
        const nextReviewDays = intervals[intervalIndex];
        progress.nextReview = Date.now() + (1000 * 60 * 60 * 24 * nextReviewDays);
      } else {
        progress.incorrect++;
        progress.streak = 0;
        
        // Reset to shorter interval
        progress.nextReview = Date.now() + (1000 * 60 * 60); // 1 hour
      }
      
      progress.lastAttempt = Date.now();
      
      // Calculate mastery level (0-100)
      const totalAttempts = progress.correct + progress.incorrect;
      const accuracy = totalAttempts > 0 ? progress.correct / totalAttempts : 0;
      const masteryLevel = Math.min(100, Math.round(accuracy * 100 + progress.streak * 5));
      
      // Update vocabulary mastery level
      const vocabulary = await this.getVocabulary(wordId);
      if (vocabulary) {
        vocabulary.masteryLevel = masteryLevel;
        vocabulary.lastReviewed = Date.now();
        vocabulary.reviewCount = totalAttempts;
        await this.saveVocabulary(vocabulary);
      }
      
      await this.saveProgress(progress);
      
      console.log(`Word mastery updated: ${wordId}, Level: ${masteryLevel}`);
    } catch (error) {
      console.error('Failed to update word mastery:', error);
      throw error;
    }
  }

  /**
   * Offline Sync Management
   */
  private addToSyncQueue(type: string, data: any): void {
    this.syncQueue.push({
      type,
      data,
      timestamp: Date.now(),
    });
    
    // Limit sync queue size
    if (this.syncQueue.length > 1000) {
      this.syncQueue = this.syncQueue.slice(-1000);
    }
  }

  async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    try {
      console.log(`Syncing ${this.syncQueue.length} offline items...`);
      
      // Group sync items by type
      const syncGroups = this.groupSyncItems();
      
      // Sync each group
      for (const [type, items] of Object.entries(syncGroups)) {
        await this.syncItemGroup(type, items);
      }
      
      // Clear sync queue
      this.syncQueue = [];
      
      // Update last sync time
      await AsyncStorage.setItem('last_sync_time', Date.now().toString());
      
      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  private groupSyncItems(): { [key: string]: any[] } {
    const groups: { [key: string]: any[] } = {};
    
    for (const item of this.syncQueue) {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type].push(item.data);
    }
    
    return groups;
  }

  private async syncItemGroup(type: string, items: any[]): Promise<void> {
    // This would make API calls to sync with backend
    // For now, we'll just log the sync operation
    console.log(`Syncing ${items.length} items of type: ${type}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.syncOfflineData();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Cache Management
   */
  async getCacheSize(): Promise<number> {
    try {
      // This is an approximation - MMKV doesn't provide exact size
      const vocabularies = await this.getAllVocabularies();
      return vocabularies.length * 1024; // Approximate 1KB per vocabulary
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Clear vocabulary data
      const vocabularies = await this.getAllVocabularies();
      for (const vocab of vocabularies) {
        await this.deleteVocabulary(vocab.id);
      }
      
      // Clear progress data
      storage.clearAll();
      
      // Clear vocabulary index
      await AsyncStorage.removeItem('vocabulary_index');
      
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Export/Import Data
   */
  async exportData(): Promise<SyncData> {
    try {
      const vocabularies = await this.getAllVocabularies();
      const progressList: OfflineProgress[] = [];
      
      // Get all progress data
      for (const vocab of vocabularies) {
        const progress = await this.getProgress('current_user', vocab.id);
        if (progress) {
          progressList.push(progress);
        }
      }
      
      const lastSyncTime = await AsyncStorage.getItem('last_sync_time');
      
      return {
        vocabularies,
        progress: progressList,
        lastSyncTime: lastSyncTime ? parseInt(lastSyncTime) : 0,
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(syncData: SyncData): Promise<void> {
    try {
      console.log(`Importing ${syncData.vocabularies.length} vocabularies...`);
      
      // Import vocabularies
      for (const vocab of syncData.vocabularies) {
        await this.saveVocabulary(vocab);
      }
      
      // Import progress
      for (const progress of syncData.progress) {
        await this.saveProgress(progress);
      }
      
      // Update last sync time
      await AsyncStorage.setItem('last_sync_time', syncData.lastSyncTime.toString());
      
      console.log('Data import completed');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Utility Methods
   */
  isOfflineMode(): boolean {
    return !this.isOnline;
  }

  async getLastSyncTime(): Promise<number> {
    try {
      const lastSync = await AsyncStorage.getItem('last_sync_time');
      return lastSync ? parseInt(lastSync) : 0;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return 0;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    console.log('OfflineLearningService destroyed');
  }
}

// Export singleton instance
export const offlineLearningService = new OfflineLearningService();
export default offlineLearningService;