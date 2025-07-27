/**
 * API Route: Generate Vocabulary Definitions with Claude AI
 * Server-side Claude API integration for vocabulary explanations
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words, difficulty } = body;

    // Validate input
    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid words array' },
        { status: 400 }
      );
    }

    if (!difficulty) {
      return NextResponse.json(
        { error: 'Missing difficulty parameter' },
        { status: 400 }
      );
    }

    // Check if Claude API is available
    if (!process.env.CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API not configured' },
        { status: 503 }
      );
    }

    const prompt = `Create detailed vocabulary definitions for these words for ${difficulty} level English learners:

Words: ${words.join(', ')}

For each word, provide:
1. Clear, simple definition appropriate for ${difficulty} learners
2. Phonetic pronunciation in IPA format
3. Part of speech
4. 2-3 example sentences showing proper usage
5. Difficulty level assessment

Format as JSON array with this exact structure:
[
  {
    "word": "example",
    "definition": "clear definition here",
    "pronunciation": "/ɪɡˈzæmpəl/",
    "partOfSpeech": "noun",
    "examples": ["sentence 1", "sentence 2"],
    "difficulty": "intermediate"
  }
]

Important: 
- Keep definitions simple and clear
- Use vocabulary appropriate for ${difficulty} level
- Make example sentences practical and memorable
- Ensure pronunciation is accurate IPA format`;

    // Call Claude API
    const response = await anthropic.messages.create({
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
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude API');
    }

    // Parse the response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate the structure
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    // Add metadata
    const result = {
      vocabulary: parsed,
      generatedAt: new Date().toISOString(),
      difficulty,
      wordCount: parsed.length
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in generate-vocabulary API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate vocabulary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}