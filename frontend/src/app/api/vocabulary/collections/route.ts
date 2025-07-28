/**
 * API Route: Vocabulary Collections Management
 * Handles CRUD operations for vocabulary collections (word books)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, checkDatabaseConnection, prisma } from '@/lib/prisma';

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
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const collections = await db.vocabulary.getCollections(userId, {
      category: category || undefined,
      level: level || undefined,
      search: search || undefined
    });

    return NextResponse.json({
      collections,
      total: collections.length
    });

  } catch (error) {
    console.error('Error fetching vocabulary collections:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch vocabulary collections',
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
    const { title, description, category, level, userId, isPublic, words } = body;

    // Validate required fields
    if (!title || !userId || !level) {
      return NextResponse.json(
        { error: 'Title, user ID, and level are required' },
        { status: 400 }
      );
    }

    // Create collection
    const collection = await db.vocabulary.createCollection({
      title,
      description,
      category,
      level,
      userId,
      isPublic: isPublic || false
    });

    // Add words if provided
    if (words && words.length > 0) {
      await db.vocabulary.addWordsToCollection(collection.id, words);
      
      // Update word count
      await db.vocabulary.updateCollection(collection.id, {
        wordCount: words.length
      });
    }

    // Fetch the complete collection with words
    const completeCollection = await db.vocabulary.getCollections(userId, {});
    const newCollection = completeCollection.find(c => c.id === collection.id);

    return NextResponse.json({
      message: 'Vocabulary collection created successfully',
      collection: newCollection
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating vocabulary collection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create vocabulary collection',
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
    const { collectionId, title, description, category, level, isPublic } = body;

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Update collection
    const updatedCollection = await db.vocabulary.updateCollection(collectionId, {
      title,
      description,
      category,
      level
    });

    return NextResponse.json({
      message: 'Collection updated successfully',
      collection: updatedCollection
    });

  } catch (error) {
    console.error('Error updating vocabulary collection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update vocabulary collection',
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
    const collectionId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!collectionId || !userId) {
      return NextResponse.json(
        { error: 'Collection ID and user ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const collection = await prisma.vocabularyCollection.findFirst({
      where: {
        id: collectionId,
        userId: userId
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete collection (cascade will delete associated words)
    await prisma.vocabularyCollection.delete({
      where: { id: collectionId }
    });

    return NextResponse.json({
      message: 'Collection deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting vocabulary collection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete vocabulary collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}