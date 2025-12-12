import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, prompt, model, imageUrl, duration } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const kieApiKey = process.env.KIE_API_KEY;
    if (!kieApiKey || kieApiKey === 'your_kie_api_key_here') {
      return NextResponse.json({
        error: 'Kie API key not configured. Please add your token to .env.local'
      }, { status: 500 });
    }

    console.log(`Starting Kie ${type} generation:`, prompt);

    let endpoint = '';
    let requestBody: Record<string, unknown> = {};

    // Configure endpoint based on type
    if (type === 'image') {
      // Image generation (e.g., Flux, Imagen4)
      endpoint = 'https://api.kie.ai/v1/images/generations';
      requestBody = {
        model: model || 'flux-1.1-pro',
        prompt,
        n: 1,
        size: '1024x1024',
      };

    } else if (type === 'video') {
      // Video generation (e.g., Veo3.1, Runway Gen-3)
      endpoint = 'https://api.kie.ai/v1/videos/generations';
      requestBody = {
        model: model || 'veo-3.1',
        prompt,
        duration: duration || 5,
      };

    } else if (type === 'audio') {
      // Audio/Music generation
      endpoint = 'https://api.kie.ai/v1/audio/generations';
      requestBody = {
        model: model || 'elevenlabs-tts',
        prompt,
      };

    } else {
      return NextResponse.json({
        error: 'Invalid generation type'
      }, { status: 400 });
    }

    // Call Kie API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${kieApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Kie API error:', errorData);
      return NextResponse.json({
        error: 'Kie API request failed',
        details: errorData
      }, { status: response.status });
    }

    const result = await response.json();

    // Save to Firestore
    if (adminDb) {
      const timestamp = new Date().toISOString();
      await adminDb.collection('kie_generations').add({
        userId,
        type,
        model,
        prompt,
        imageUrl: imageUrl || null,
        duration: duration || null,
        output: result,
        createdAt: timestamp,
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Generation completed successfully',
    });

  } catch (error: unknown) {
    console.error('Error with Kie generation:', error);

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
      .collection('kie_generations')
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
