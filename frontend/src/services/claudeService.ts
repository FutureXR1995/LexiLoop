/**
 * Claude AI Service
 * Handles AI content generation using Anthropic's Claude API
 */

import Anthropic from '@anthropic-ai/sdk';

interface StoryGenerationParams {
  topic?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  vocabularyWords?: string[];
  includeVocabulary?: boolean;
}

interface VocabularyDefinition {
  word: string;
  definition: string;
  pronunciation: string;
  partOfSpeech: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface GeneratedStory {
  title: string;
  content: string;
  vocabularyWords: VocabularyDefinition[];
  difficulty: string;
  wordCount: number;
  readingTime: number;
}

class ClaudeService {
  private client: Anthropic | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const apiKey = process.env.CLAUDE_API_KEY;
      
      if (!apiKey) {
        console.warn('Claude API key not found. AI content generation will use mock data.');
        return;
      }

      this.client = new Anthropic({
        apiKey: apiKey,
      });
      
      this.isInitialized = true;
      console.log('Claude AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Claude AI Service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if Claude API is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * Generate a vocabulary learning story
   */
  async generateStory(params: StoryGenerationParams): Promise<GeneratedStory> {
    if (!this.isAvailable()) {
      return this.generateMockStory(params);
    }

    try {
      const prompt = this.buildStoryPrompt(params);
      
      const response = await this.client!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseStoryResponse(content.text, params);
      } else {
        throw new Error('Unexpected response format from Claude API');
      }
    } catch (error) {
      console.error('Error generating story with Claude:', error);
      return this.generateMockStory(params);
    }
  }

  /**
   * Generate vocabulary definitions for words
   */
  async generateVocabularyDefinitions(words: string[], difficulty: string): Promise<VocabularyDefinition[]> {
    if (!this.isAvailable()) {
      return this.generateMockVocabulary(words, difficulty as any);
    }

    try {
      const prompt = `Create detailed vocabulary definitions for these words for ${difficulty} level English learners:

Words: ${words.join(', ')}

For each word, provide:
1. Clear, simple definition
2. Phonetic pronunciation (IPA format)
3. Part of speech
4. 2-3 example sentences
5. Difficulty level assessment

Format as JSON array with this structure:
[
  {
    "word": "example",
    "definition": "clear definition here",
    "pronunciation": "/ɪɡˈzæmpəl/",
    "partOfSpeech": "noun",
    "examples": ["sentence 1", "sentence 2"],
    "difficulty": "intermediate"
  }
]`;

      const response = await this.client!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseVocabularyResponse(content.text);
      } else {
        return this.generateMockVocabulary(words, difficulty as any);
      }
    } catch (error) {
      console.error('Error generating vocabulary with Claude:', error);
      return this.generateMockVocabulary(words, difficulty as any);
    }
  }

  /**
   * Generate quiz questions for a story
   */
  async generateQuizQuestions(storyContent: string, vocabularyWords: string[]): Promise<any[]> {
    if (!this.isAvailable()) {
      return this.generateMockQuiz(vocabularyWords);
    }

    try {
      const prompt = `Based on this story and vocabulary words, create 10 quiz questions:

Story: ${storyContent.substring(0, 1000)}...

Vocabulary: ${vocabularyWords.join(', ')}

Create a mix of:
- 3 reading comprehension questions
- 4 vocabulary definition questions  
- 3 vocabulary usage questions

Format as JSON array with this structure:
[
  {
    "type": "comprehension",
    "question": "What was the main character's goal?",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": 0,
    "explanation": "explanation here"
  }
]`;

      const response = await this.client!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseQuizResponse(content.text);
      } else {
        return this.generateMockQuiz(vocabularyWords);
      }
    } catch (error) {
      console.error('Error generating quiz with Claude:', error);
      return this.generateMockQuiz(vocabularyWords);
    }
  }

  /**
   * Build the story generation prompt
   */
  private buildStoryPrompt(params: StoryGenerationParams): string {
    const { topic, difficulty, wordCount, vocabularyWords } = params;
    
    let prompt = `Create an engaging story for ${difficulty} level English learners. 

Requirements:
- Word count: approximately ${wordCount} words
- Difficulty: ${difficulty} level vocabulary and grammar
- Genre: Educational narrative with adventure/mystery elements
- Target audience: Adult language learners`;

    if (topic) {
      prompt += `\n- Topic/Theme: ${topic}`;
    }

    if (vocabularyWords && vocabularyWords.length > 0) {
      prompt += `\n- Include these vocabulary words naturally: ${vocabularyWords.join(', ')}`;
    }

    prompt += `\n\nFormat the response as JSON:
{
  "title": "Story Title",
  "content": "Full story text here...",
  "vocabularyWords": [
    {
      "word": "example",
      "definition": "clear definition",
      "pronunciation": "/pronunciation/",
      "partOfSpeech": "noun",
      "examples": ["example sentence 1", "example sentence 2"],
      "difficulty": "intermediate"
    }
  ]
}

Make the story engaging with:
- Clear narrative structure
- Relatable characters
- Educational value
- Natural vocabulary integration
- Appropriate pacing for language learners`;

    return prompt;
  }

  /**
   * Parse Claude's story response
   */
  private parseStoryResponse(response: string, params: StoryGenerationParams): GeneratedStory {
    try {
      // Extract JSON from response (Claude sometimes adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title || 'Generated Story',
        content: parsed.content || '',
        vocabularyWords: parsed.vocabularyWords || [],
        difficulty: params.difficulty,
        wordCount: this.countWords(parsed.content || ''),
        readingTime: Math.ceil(this.countWords(parsed.content || '') / 200) // ~200 WPM
      };
    } catch (error) {
      console.error('Error parsing story response:', error);
      return this.generateMockStory(params);
    }
  }

  /**
   * Parse vocabulary response
   */
  private parseVocabularyResponse(response: string): VocabularyDefinition[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing vocabulary response:', error);
      return [];
    }
  }

  /**
   * Parse quiz response
   */
  private parseQuizResponse(response: string): any[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing quiz response:', error);
      return [];
    }
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Generate mock story for fallback
   */
  private generateMockStory(params: StoryGenerationParams): GeneratedStory {
    return {
      title: 'The Mysterious Discovery',
      content: `Elena had always been curious about the old library at the edge of town. Every day after school, she would walk past its weathered stone walls and wonder what secrets lay hidden inside. The building had been abandoned for years, but something about it called to her.

One afternoon, Elena noticed that the heavy wooden door was slightly open. Her heart raced with excitement and nervousness. Should she investigate? After a moment of hesitation, she decided to push the door open and step inside.

The interior was magnificent, even in its neglected state. Tall shelves stretched from floor to ceiling, filled with countless books covered in dust. Sunlight streamed through dirty windows, creating mysterious patterns on the wooden floor.

As Elena explored deeper into the library, she discovered something extraordinary. In a hidden alcove behind the reference section, she found a collection of ancient manuscripts written in languages she didn't recognize. The pages seemed to shimmer with an otherworldly energy.

Elena realized she had stumbled upon something truly remarkable. This discovery would change her life forever, opening doors to adventures she had never imagined possible.`,
      vocabularyWords: [
        {
          word: 'curious',
          definition: 'Eager to know or learn something',
          pronunciation: '/ˈkjʊriəs/',
          partOfSpeech: 'adjective',
          examples: [
            'She was curious about the old building.',
            'Children are naturally curious about the world.'
          ],
          difficulty: 'beginner'
        },
        {
          word: 'mysterious',
          definition: 'Difficult to understand or explain; strange',
          pronunciation: '/mɪˈstɪriəs/',
          partOfSpeech: 'adjective',
          examples: [
            'The house had a mysterious atmosphere.',
            'She gave him a mysterious smile.'
          ],
          difficulty: 'intermediate'
        }
      ],
      difficulty: params.difficulty,
      wordCount: 247,
      readingTime: 2
    };
  }

  /**
   * Generate mock vocabulary
   */
  private generateMockVocabulary(words: string[], difficulty: 'beginner' | 'intermediate' | 'advanced'): VocabularyDefinition[] {
    return words.map(word => ({
      word,
      definition: `A ${difficulty} level definition for ${word}`,
      pronunciation: `/${word}/`,
      partOfSpeech: 'noun',
      examples: [
        `This is an example sentence with ${word}.`,
        `Another example showing how to use ${word}.`
      ],
      difficulty
    }));
  }

  /**
   * Generate mock quiz
   */
  private generateMockQuiz(vocabularyWords: string[]): any[] {
    return [
      {
        type: 'comprehension',
        question: 'What was the main character curious about?',
        options: ['The old library', 'The school', 'The town', 'The books'],
        correctAnswer: 0,
        explanation: 'Elena was curious about the old library at the edge of town.'
      },
      {
        type: 'vocabulary',
        question: `What does "curious" mean?`,
        options: ['Afraid', 'Eager to learn', 'Tired', 'Angry'],
        correctAnswer: 1,
        explanation: 'Curious means eager to know or learn something.'
      }
    ];
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();
export default claudeService;