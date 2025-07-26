/**
 * Enhanced Three-Layer Testing Component
 * Comprehensive word testing with improved UI/UX
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { VoiceButton } from '@/components/features/voice/VoiceButton';
import { CheckCircle, XCircle, Clock, Target, Zap, BookOpen, ArrowRight, SkipForward } from 'lucide-react';

interface Question {
  id: string;
  type: 'word_meaning' | 'typing' | 'comprehension';
  vocabularyId: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  responseTime?: number;
}

interface TestComponentProps {
  storyId: string;
  vocabularyIds: string[];
  onComplete: (results: TestResult[]) => void;
}

interface TestResult {
  questionId: string;
  vocabularyId: string;
  testType: string;
  isCorrect: boolean;
  responseTime: number;
  userAnswer: string;
  correctAnswer: string;
}

export function TestComponent({ storyId, vocabularyIds, onComplete }: TestComponentProps) {
  const [currentLayer, setCurrentLayer] = useState<1 | 2 | 3>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const generateQuestions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Mock questions generation - in real app, this would call the API
      const mockQuestions: Question[] = [];
      
      // Mock vocabulary data
      const vocabularyData = {
        'vocab-1': { word: 'mysterious', definition: 'Full of mystery; difficult to understand' },
        'vocab-2': { word: 'fascinating', definition: 'Extremely interesting and captivating' },
        'vocab-3': { word: 'adventure', definition: 'An exciting or remarkable experience' },
        'vocab-4': { word: 'extraordinary', definition: 'Very unusual or remarkable' }
      };

      vocabularyIds.forEach((vocabId, index) => {
        const vocab = vocabularyData[vocabId as keyof typeof vocabularyData] || 
                     { word: 'adventure', definition: 'An exciting experience' };
        
        if (currentLayer === 1) {
          // Layer 1: Word meaning choice
          const distractors = [
            'A type of food or cuisine',
            'A mathematical concept or formula',
            'A musical instrument or device',
            'A architectural structure'
          ];
          
          mockQuestions.push({
            id: `q${currentLayer}_${index}`,
            type: 'word_meaning',
            vocabularyId: vocabId,
            question: `What does "${vocab.word}" mean?`,
            options: [
              vocab.definition,
              ...distractors.slice(0, 3)
            ].sort(() => Math.random() - 0.5),
            correctAnswer: vocab.definition
          });
        } else if (currentLayer === 2) {
          // Layer 2: Typing test
          mockQuestions.push({
            id: `q${currentLayer}_${index}`,
            type: 'typing',
            vocabularyId: vocabId,
            question: `Listen carefully and type the word you hear. Definition: "${vocab.definition}"`,
            correctAnswer: vocab.word
          });
        } else if (currentLayer === 3) {
          // Layer 3: Comprehension
          const contexts = [
            'In the story context, how was this word used?',
            'Based on the reading, what best describes this word?',
            'From the story, what does this word represent?',
            'According to the text, this word means:'
          ];
          
          mockQuestions.push({
            id: `q${currentLayer}_${index}`,
            type: 'comprehension',
            vocabularyId: vocabId,
            question: contexts[index % contexts.length],
            options: [
              vocab.definition,
              'Something completely different from the context',
              'An unrelated concept from the story',
              'A misinterpretation of the word'
            ].sort(() => Math.random() - 0.5),
            correctAnswer: vocab.definition
          });
        }
      });
      
      setQuestions(mockQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLayer, vocabularyIds]);

  // Generate questions for each layer
  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const handleAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const responseTime = Date.now() - startTime;
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

    const result: TestResult = {
      questionId: currentQuestion.id,
      vocabularyId: currentQuestion.vocabularyId,
      testType: currentQuestion.type,
      isCorrect,
      responseTime,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer
    };

    const newResults = [...results, result];
    setResults(newResults);

    // Show immediate feedback
    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    // Wait for feedback animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowFeedback(false);
    setIsTransitioning(true);

    // Move to next question with transition
    await new Promise(resolve => setTimeout(resolve, 300));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setStartTime(Date.now());
    } else {
      // Move to next layer or complete test
      if (currentLayer < 3) {
        setCurrentLayer((currentLayer + 1) as 1 | 2 | 3);
      } else {
        // Test completed
        onComplete(newResults);
      }
    }

    setIsTransitioning(false);
  };

  const handleOptionSelect = (option: string) => {
    setUserAnswer(option);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentLayer - 1) * vocabularyIds.length + currentQuestionIndex + 1) / (3 * vocabularyIds.length) * 100;

  const layerNames = {
    1: 'Word Meaning',
    2: 'Typing Practice', 
    3: 'Reading Comprehension'
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🧠</div>
          <p>Generating test questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>No questions available</p>
        </CardContent>
      </Card>
    );
  }

  // Get layer icon and color
  const getLayerInfo = (layer: number) => {
    switch (layer) {
      case 1:
        return { icon: Target, color: 'bg-blue-500', name: 'Word Meaning', bgColor: 'bg-blue-50' };
      case 2:
        return { icon: Zap, color: 'bg-green-500', name: 'Typing Practice', bgColor: 'bg-green-50' };
      case 3:
        return { icon: BookOpen, color: 'bg-purple-500', name: 'Reading Comprehension', bgColor: 'bg-purple-50' };
      default:
        return { icon: Target, color: 'bg-gray-500', name: 'Test', bgColor: 'bg-gray-50' };
    }
  };

  const layerInfo = getLayerInfo(currentLayer);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Enhanced Progress Header (Mobile Responsive) */}
      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-opacity-20 transition-all duration-500 ${layerInfo.bgColor} border-${layerInfo.color.replace('bg-', '')}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className={`p-2 sm:p-3 rounded-lg ${layerInfo.color} text-white`}>
              <layerInfo.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                <span className="sm:hidden">L{currentLayer}: {layerInfo.name.split(' ')[0]}</span>
                <span className="hidden sm:inline">Layer {currentLayer}: {layerInfo.name}</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-500 self-end sm:self-auto">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {Math.floor((Date.now() - startTime) / 1000)}s
            </span>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-700 font-medium">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="bg-white bg-opacity-50 rounded-full h-4 overflow-hidden">
            <div 
              className={`${layerInfo.color} h-4 rounded-full transition-all duration-700 ease-out relative`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Overlay */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300">
          <div className={`p-8 rounded-2xl shadow-2xl transform transition-all duration-500 ${
            lastAnswerCorrect 
              ? 'bg-green-500 text-white scale-110' 
              : 'bg-red-500 text-white scale-110'
          }`}>
            <div className="text-center">
              {lastAnswerCorrect ? (
                <CheckCircle className="w-16 h-16 mx-auto mb-4 animate-bounce" />
              ) : (
                <XCircle className="w-16 h-16 mx-auto mb-4 animate-bounce" />
              )}
              <h3 className="text-2xl font-bold mb-2">
                {lastAnswerCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
              <p className="text-lg opacity-90">
                {lastAnswerCorrect 
                  ? 'Great job! Moving to next question...' 
                  : `Correct answer: ${questions[currentQuestionIndex]?.correctAnswer}`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Question Card (Mobile Responsive) */}
      <Card className={`transition-all duration-500 transform ${
        isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      } shadow-lg sm:shadow-xl border border-gray-200 sm:border-2 ${showFeedback ? 'pointer-events-none' : ''}`}>
        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl text-gray-800 flex-1 leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
            {/* Voice pronunciation for word meaning and typing questions */}
            {(currentQuestion.type === 'word_meaning' || currentQuestion.type === 'typing') && (
              <div className="flex justify-center sm:justify-end">
                <VoiceButton
                  text={currentQuestion.correctAnswer}
                  size="sm"
                  variant="ghost"
                  className="shrink-0"
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Enhanced Multiple Choice Questions (Mobile Responsive) */}
          {currentQuestion.options && (
            <div className="space-y-2 sm:space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showFeedback}
                  className={`w-full p-3 sm:p-4 text-left border-2 rounded-lg sm:rounded-xl transition-all duration-200 transform active:scale-[0.98] sm:hover:scale-[1.02] ${
                    userAnswer === option
                      ? `border-${layerInfo.color.replace('bg-', '')} ${layerInfo.bgColor} shadow-md`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                  } ${showFeedback ? 'pointer-events-none opacity-75' : ''}`}
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      userAnswer === option
                        ? `${layerInfo.color} text-white`
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`flex-1 text-sm sm:text-base leading-relaxed ${
                      userAnswer === option ? 'font-medium' : ''
                    }`}>
                      {option}
                    </span>
                    {userAnswer === option && (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Enhanced Text Input Questions (Mobile Responsive) */}
          {!currentQuestion.options && (
            <div className="space-y-4 sm:space-y-6">
              {/* Enhanced Audio playback for typing questions */}
              {currentQuestion.type === 'typing' && (
                <div className={`text-center p-6 sm:p-8 ${layerInfo.bgColor} border-2 border-${layerInfo.color.replace('bg-', '')} border-opacity-20 rounded-lg sm:rounded-xl`}>
                  <div className="mb-4">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full ${layerInfo.color} flex items-center justify-center mb-3`}>
                      <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Listen Carefully</h3>
                    <p className="text-sm text-gray-600 mb-4">Tap to hear the word</p>
                  </div>
                  <VoiceButton
                    text={currentQuestion.correctAnswer}
                    size="lg"
                    variant="default"
                    className="shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="text-lg sm:text-xl p-4 sm:p-6 border-2 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-opacity-20 transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && !showFeedback && handleAnswer()}
                  autoFocus
                  disabled={showFeedback}
                />
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {currentQuestion.type === 'typing' 
                      ? '💡 Listen and type exactly what you hear'
                      : '✍️ Type your answer and press Enter'
                    }
                  </p>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {userAnswer.length}/50
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons (Mobile Responsive) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-100 gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                // Skip question (for demo purposes)
                setUserAnswer(currentQuestion.correctAnswer);
                handleAnswer();
              }}
              disabled={showFeedback}
              className="px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 order-2 sm:order-1"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip</span>
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 order-1 sm:order-2">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left mb-2 sm:mb-0">
                {userAnswer.trim() ? '✓ Answer ready' : 'Enter your answer'}
              </div>
              
              <Button
                onClick={handleAnswer}
                disabled={!userAnswer.trim() || showFeedback}
                className={`px-6 sm:px-8 py-3 flex items-center justify-center space-x-2 font-semibold ${layerInfo.color} hover:shadow-lg transition-all duration-200 transform active:scale-95 sm:hover:scale-105 w-full sm:w-auto`}
              >
                <span>
                  {currentQuestionIndex === questions.length - 1 && currentLayer === 3
                    ? 'Complete Test'
                    : 'Submit Answer'
                  }
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Layer Progress (Mobile Responsive) */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">Test Progress</h3>
        <div className="flex justify-center space-x-4 sm:space-x-6">
          {[
            { id: 1, name: 'Word Meaning', icon: Target, color: 'blue', shortName: 'Meaning' },
            { id: 2, name: 'Typing Practice', icon: Zap, color: 'green', shortName: 'Typing' },
            { id: 3, name: 'Reading Comprehension', icon: BookOpen, color: 'purple', shortName: 'Reading' }
          ].map((layer) => {
            const LayerIcon = layer.icon;
            const isCompleted = layer.id < currentLayer;
            const isActive = layer.id === currentLayer;
            const isPending = layer.id > currentLayer;
            
            return (
              <div key={layer.id} className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500 text-white transform scale-105 sm:scale-110' 
                    : isActive
                    ? `bg-${layer.color}-500 text-white transform scale-110 sm:scale-125 shadow-lg animate-pulse`
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                  ) : (
                    <LayerIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                  )}
                  {isActive && (
                    <div className={`absolute -inset-1 bg-${layer.color}-500 rounded-full opacity-30 animate-ping`} />
                  )}
                </div>
                
                <div className="text-center">
                  <div className={`text-xs sm:text-sm font-medium ${
                    isCompleted ? 'text-green-600' : isActive ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    L{layer.id}
                  </div>
                  <div className={`text-xs hidden sm:block ${
                    isCompleted ? 'text-green-500' : isActive ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {layer.shortName}
                  </div>
                  <div className="text-xs font-semibold mt-1">
                    {isCompleted && (
                      <span className="text-green-600">✓</span>
                    )}
                    {isActive && (
                      <span className="text-blue-600">🎯</span> 
                    )}
                    {isPending && (
                      <span className="text-gray-400">⏳</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress connectors */}
        <div className="flex justify-center mt-3 sm:mt-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {[1, 2].map((i) => (
              <div key={i} className={`h-1 w-8 sm:w-12 rounded-full transition-all duration-500 ${
                i < currentLayer ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}