/**
 * VocabularyCard Component
 * Mobile-optimized vocabulary learning card with voice features
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Card, Button, IconButton, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import { mobileVoiceService, VoiceRecognitionResult } from '../services/MobileVoiceService';
import { offlineLearningService, OfflineVocabulary } from '../services/OfflineLearningService';
import { theme } from '../utils/theme';
import { useTranslation } from '../hooks/useTranslation';

const { width: screenWidth } = Dimensions.get('window');

interface VocabularyCardProps {
  vocabulary: OfflineVocabulary;
  userId: string;
  onMasteryUpdate?: (wordId: string, correct: boolean) => void;
  onNext?: () => void;
  showAnswer?: boolean;
  style?: any;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  vocabulary,
  userId,
  onMasteryUpdate,
  onNext,
  showAnswer = false,
  style,
}) => {
  const { t } = useTranslation();
  const [isRevealed, setIsRevealed] = useState(showAnswer);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<{
    accuracy: number;
    transcript: string;
  } | null>(null);
  const [flipAnimation] = useState(new Animated.Value(0));

  const handlePlayAudio = useCallback(async () => {
    try {
      setIsSpeaking(true);
      await mobileVoiceService.speak(vocabulary.word, {
        rate: 0.8,
        pitch: 1.0,
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [vocabulary.word]);

  const handlePronunciationPractice = useCallback(async () => {
    try {
      setIsListening(true);
      setPronunciationResult(null);

      await mobileVoiceService.practicePronunciation(
        vocabulary.word,
        (accuracy, transcript) => {
          setPronunciationResult({ accuracy, transcript });
          setIsListening(false);

          // Update mastery based on pronunciation accuracy
          const isCorrect = accuracy > 0.7;
          if (onMasteryUpdate) {
            onMasteryUpdate(vocabulary.id, isCorrect);
          }
        },
        (error) => {
          console.error('Pronunciation practice error:', error);
          setIsListening(false);
        }
      );
    } catch (error) {
      console.error('Failed to start pronunciation practice:', error);
      setIsListening(false);
    }
  }, [vocabulary.word, vocabulary.id, onMasteryUpdate]);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
    Animated.spring(flipAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [flipAnimation]);

  const handleMasteryFeedback = useCallback(async (correct: boolean) => {
    try {
      await offlineLearningService.updateWordMastery(userId, vocabulary.id, correct);
      if (onMasteryUpdate) {
        onMasteryUpdate(vocabulary.id, correct);
      }
      if (onNext) {
        setTimeout(onNext, 500); // Small delay for feedback
      }
    } catch (error) {
      console.error('Failed to update mastery:', error);
    }
  }, [userId, vocabulary.id, onMasteryUpdate, onNext]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return theme.colors.success;
      case 'intermediate':
        return theme.colors.warning;
      case 'advanced':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getMasteryProgress = () => {
    return vocabulary.masteryLevel / 100;
  };

  const flipInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Card style={styles.card} elevation={8}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={styles.gradient}
        >
          {/* Header with difficulty and progress */}
          <View style={styles.header}>
            <View style={styles.difficultyBadge}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(vocabulary.difficulty) }]}>
                {vocabulary.difficulty.toUpperCase()}
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{t('learning.mastery')}: {vocabulary.masteryLevel}%</Text>
              <ProgressBar
                progress={getMasteryProgress()}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          </View>

          {/* Main content */}
          <Animated.View
            style={[
              styles.cardContent,
              {
                transform: [{ rotateY: flipInterpolate }],
              },
            ]}
          >
            {!isRevealed ? (
              // Front side - Question
              <View style={styles.frontSide}>
                <Text style={styles.word}>{vocabulary.word}</Text>
                <Text style={styles.pronunciation}>
                  {vocabulary.pronunciation ? `/${vocabulary.pronunciation}/` : ''}
                </Text>
                
                {/* Voice controls */}
                <View style={styles.voiceControls}>
                  <TouchableOpacity
                    style={[styles.voiceButton, isSpeaking && styles.voiceButtonActive]}
                    onPress={handlePlayAudio}
                    disabled={isSpeaking}
                  >
                    <Icon
                      name={isSpeaking ? 'volume-up' : 'play-arrow'}
                      size={32}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.voiceButtonText}>{t('voice.listen')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
                    onPress={handlePronunciationPractice}
                    disabled={isListening}
                  >
                    <Icon
                      name={isListening ? 'mic' : 'mic-none'}
                      size={32}
                      color={theme.colors.secondary}
                    />
                    <Text style={styles.voiceButtonText}>{t('voice.practice')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Pronunciation result */}
                {pronunciationResult && (
                  <Animatable.View
                    animation="fadeInUp"
                    style={[
                      styles.pronunciationResult,
                      {
                        backgroundColor: pronunciationResult.accuracy > 0.7
                          ? theme.colors.success + '20'
                          : theme.colors.error + '20',
                      },
                    ]}
                  >
                    <Text style={styles.pronunciationScore}>
                      {t('learning.accuracy')}: {Math.round(pronunciationResult.accuracy * 100)}%
                    </Text>
                    <Text style={styles.pronunciationTranscript}>
                      {t('voice.youSaid')}: "{pronunciationResult.transcript}"
                    </Text>
                  </Animatable.View>
                )}

                <Button
                  mode="contained"
                  onPress={handleReveal}
                  style={styles.revealButton}
                  contentStyle={styles.revealButtonContent}
                >
{t('learning.definition')}
                </Button>
              </View>
            ) : (
              // Back side - Answer
              <View style={styles.backSide}>
                <Text style={styles.definition}>{vocabulary.definition}</Text>
                
                {vocabulary.exampleSentence && (
                  <View style={styles.exampleContainer}>
                    <Text style={styles.exampleLabel}>{t('learning.example')}:</Text>
                    <Text style={styles.exampleSentence}>"{vocabulary.exampleSentence}"</Text>
                  </View>
                )}

                {vocabulary.category && (
                  <View style={styles.categoryContainer}>
                    <Icon name="category" size={16} color={theme.colors.secondary} />
                    <Text style={styles.categoryText}>{vocabulary.category}</Text>
                  </View>
                )}

                {/* Mastery feedback buttons */}
                <View style={styles.masteryButtons}>
                  <TouchableOpacity
                    style={[styles.masteryButton, styles.masteryButtonIncorrect]}
                    onPress={() => handleMasteryFeedback(false)}
                  >
                    <Icon name="thumb-down" size={24} color="#fff" />
                    <Text style={styles.masteryButtonText}>{t('learning.difficulty')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.masteryButton, styles.masteryButtonCorrect]}
                    onPress={() => handleMasteryFeedback(true)}
                  >
                    <Icon name="thumb-up" size={24} color="#fff" />
                    <Text style={styles.masteryButtonText}>{t('common.ok')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </LinearGradient>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth - 32,
    alignSelf: 'center',
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  frontSide: {
    alignItems: 'center',
  },
  backSide: {
    flex: 1,
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  pronunciation: {
    fontSize: 18,
    color: theme.colors.secondary,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  voiceControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  voiceButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    minWidth: 100,
  },
  voiceButtonActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  voiceButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  pronunciationResult: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  pronunciationScore: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  pronunciationTranscript: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  revealButton: {
    marginTop: 'auto',
  },
  revealButtonContent: {
    paddingVertical: 8,
  },
  definition: {
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 20,
  },
  exampleContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  exampleSentence: {
    fontSize: 16,
    fontStyle: 'italic',
    color: theme.colors.onSurface,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.secondary,
  },
  masteryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  masteryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  masteryButtonCorrect: {
    backgroundColor: theme.colors.success,
  },
  masteryButtonIncorrect: {
    backgroundColor: theme.colors.error,
  },
  masteryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default VocabularyCard;