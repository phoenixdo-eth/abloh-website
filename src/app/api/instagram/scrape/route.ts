import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { adminDb } from '@/lib/firebase/admin';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profileUrl } = body;

    if (!profileUrl) {
      return NextResponse.json({ error: 'Profile URL is required' }, { status: 400 });
    }

    // Validate Instagram URL
    if (!profileUrl.includes('instagram.com')) {
      return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 });
    }

    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken || apifyToken === 'your_apify_token_here') {
      return NextResponse.json({
        error: 'Apify API token not configured. Please add your token to .env.local'
      }, { status: 500 });
    }

    // Initialize Apify client
    const client = new ApifyClient({
      token: apifyToken,
    });

    // Prepare Actor input
    const input = {
      startUrls: [profileUrl],
      resultsLimit: 100, // Limit results for cost control
      searchLimit: 1,
    };

    console.log('Starting Instagram scrape for:', profileUrl);

    // Run the Actor and wait for it to finish
    const run = await client.actor('apify/instagram-api-scraper').call(input);

    // Fetch Actor results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      return NextResponse.json({
        error: 'No data found for this profile'
      }, { status: 404 });
    }

    // Save to Firestore
    if (adminDb) {
      const timestamp = new Date().toISOString();
      const docRef = await adminDb.collection('instagram_profiles').add({
        userId,
        profileUrl,
        data: items[0],
        scrapedAt: timestamp,
        runId: run.id,
      });

      console.log('Saved to Firestore with ID:', docRef.id);
    }

    return NextResponse.json({
      success: true,
      data: items[0],
      message: 'Profile scraped successfully',
    });

  } catch (error: unknown) {
    console.error('Error scraping Instagram profile:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to scrape profile', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve saved profiles
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

    // Get all profiles for this user
    const snapshot = await adminDb
      .collection('instagram_profiles')
      .where('userId', '==', userId)
      .orderBy('scrapedAt', 'desc')
      .limit(50)
      .get();

    const profiles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      profiles,
    });

  } catch (error: unknown) {
    console.error('Error fetching profiles:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch profiles', details: errorMessage },
      { status: 500 }
    );
  }
}
