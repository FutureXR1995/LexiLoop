/**
 * API Route: Vocabulary Words Management
 * Handles individual word operations within collections
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, checkDatabaseConnection } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const userId = searchParams.get('userId');
    const wordId = searchParams.get('wordId');

    // Get specific word
    if (wordId) {
      const word = await prisma.word.findUnique({
        where: { id: wordId },
        include: {
          collection: true,
          userWords: userId ? {
            where: { userId }
          } : false
        }
      });

      if (!word) {
        return NextResponse.json(
          { error: 'Word not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ word });
    }

    // Get words in collection
    if (collectionId) {
      const words = await db.vocabulary.getWordsInCollection(collectionId);
      return NextResponse.json({ 
        words,
        total: words.length 
      });
    }

    return NextResponse.json(
      { error: 'Collection ID or word ID is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch words',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { collectionId, words } = body;

    // Validate required fields
    if (!collectionId || !words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Collection ID and words array are required' },
        { status: 400 }
      );
    }

    // Validate word structure
    for (const word of words) {
      if (!word.word || !word.definition) {
        return NextResponse.json(
          { error: 'Each word must have "word" and "definition" fields' },
          { status: 400 }
        );
      }
    }

    // Add words to collection
    await db.vocabulary.addWordsToCollection(collectionId, words);

    // Update collection word count
    const wordCount = await prisma.word.count({
      where: { collectionId }
    });

    await prisma.vocabularyCollection.update({
      where: { id: collectionId },
      data: { wordCount }
    });

    // Return updated words list
    const updatedWords = await db.vocabulary.getWordsInCollection(collectionId);

    return NextResponse.json({
      message: `${words.length} words added successfully`,
      words: updatedWords,
      total: updatedWords.length
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding words:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add words',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { wordId, word, definition, pronunciation, partOfSpeech, examples, difficulty } = body;

    if (!wordId) {
      return NextResponse.json(
        { error: 'Word ID is required' },
        { status: 400 }
      );
    }

    // Update word
    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: {
        word,
        definition,
        pronunciation,
        partOfSpeech,
        examples,
        difficulty
      },
      include: {
        collection: true,
        userWords: true
      }
    });

    return NextResponse.json({
      message: 'Word updated successfully',
      word: updatedWord
    });

  } catch (error) {
    console.error('Error updating word:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update word',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const wordId = searchParams.get('id');

    if (!wordId) {
      return NextResponse.json(
        { error: 'Word ID is required' },
        { status: 400 }
      );
    }

    // Get word to find collection for count update
    const word = await prisma.word.findUnique({
      where: { id: wordId },
      select: { collectionId: true }
    });

    if (!word) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    // Delete word
    await prisma.word.delete({
      where: { id: wordId }
    });

    // Update collection word count
    const wordCount = await prisma.word.count({
      where: { collectionId: word.collectionId }
    });

    await prisma.vocabularyCollection.update({
      where: { id: word.collectionId },
      data: { wordCount }
    });

    return NextResponse.json({
      message: 'Word deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete word',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}