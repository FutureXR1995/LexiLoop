/**
 * API Route: Generate Story with Claude AI
 * Server-side Claude API integration for security
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, difficulty, wordCount, vocabularyWords } = body;

    // Validate input
    if (!difficulty || !wordCount) {
      return NextResponse.json(
        { error: 'Missing required parameters: difficulty, wordCount' },
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

    // Build the prompt
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

    // Call Claude API
    const response = await anthropic.messages.create({
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
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude API');
    }

    // Parse the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Calculate additional metadata
    const wordCountActual = countWords(parsed.content || '');
    const readingTime = Math.ceil(wordCountActual / 200); // ~200 WPM

    const result = {
      title: parsed.title || 'Generated Story',
      content: parsed.content || '',
      vocabularyWords: parsed.vocabularyWords || [],
      difficulty,
      wordCount: wordCountActual,
      readingTime,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in generate-story API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate story',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}