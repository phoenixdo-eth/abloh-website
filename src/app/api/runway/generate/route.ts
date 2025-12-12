import { NextRequest, NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';
import { adminDb } from '@/lib/firebase/admin';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, promptText, imageUrl, ratio } = body;

    if (!promptText) {
      return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
    }

    const runwayApiKey = process.env.RUNWAY_API_KEY;
    if (!runwayApiKey || runwayApiKey === 'your_runway_api_key_here') {
      return NextResponse.json({
        error: 'Runway API key not configured. Please add your token to .env.local'
      }, { status: 500 });
    }

    const client = new RunwayML({ apiKey: runwayApiKey });

    let task;
    const generationType = type || 'text_to_image';

    console.log(`Starting Runway ${generationType}:`, promptText);

    if (generationType === 'text_to_image') {
      // Text to Image generation
      task = await client.textToImage
        .create({
          model: 'gen4_image',
          promptText,
          ratio: ratio || '1360:768',
        })
        .waitForTaskOutput();

    } else if (generationType === 'image_to_video' && imageUrl) {
      // Image to Video generation
      task = await client.imageToVideo
        .create({
          model: 'gen4_turbo',
          promptImage: imageUrl,
          promptText,
          ratio: '1280:720', // Valid ratio for Gen4 Turbo
        })
        .waitForTaskOutput();

    } else if (generationType === 'text_to_video') {
      // Text to Video generation (using Veo models)
      task = await client.textToVideo
        .create({
          model: 'veo3.1',
          promptText,
          duration: 6, // Valid durations: 4, 6, or 8 seconds
          ratio: '1280:720', // Required ratio
        })
        .waitForTaskOutput();

    } else {
      return NextResponse.json({
        error: 'Invalid generation type or missing parameters'
      }, { status: 400 });
    }

    // Save to Firestore
    if (adminDb && task) {
      const timestamp = new Date().toISOString();
      await adminDb.collection('runway_generations').add({
        userId,
        type: generationType,
        promptText,
        imageUrl: imageUrl || null,
        ratio: ratio || null,
        output: task,
        createdAt: timestamp,
      });
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Generation completed successfully',
    });

  } catch (error: unknown) {
    console.error('Error with Runway generation:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to generate content', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve saved generations
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({
        error: 'Firebase not configured'
      }, { status: 500 });
    }

    const snapshot = await adminDb
      .collection('runway_generations')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const generations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      generations,
    });

  } catch (error: unknown) {
    console.error('Error fetching generations:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch generations', details: errorMessage },
      { status: 500 }
    );
  }
}
