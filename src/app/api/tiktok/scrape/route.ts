import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { adminDb } from '@/lib/firebase/admin';
import { auth } from '@clerk/nextjs/server';

// Scraper types mapping
const SCRAPER_ACTORS = {
  general: 'clockworks/tiktok-scraper', // For hashtags, trends, search
  profile: 'clockworks/tiktok-profile-scraper', // For user profiles
  video: 'clockworks/tiktok-video-scraper', // For specific videos
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scraperType, input, resultsLimit } = body;

    if (!scraperType || !input) {
      return NextResponse.json({
        error: 'Scraper type and input are required'
      }, { status: 400 });
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

    // Select the appropriate actor
    const actorId = SCRAPER_ACTORS[scraperType as keyof typeof SCRAPER_ACTORS];
    if (!actorId) {
      return NextResponse.json({
        error: 'Invalid scraper type'
      }, { status: 400 });
    }

    // Prepare input based on scraper type
    let actorInput: Record<string, unknown> = {};

    if (scraperType === 'general') {
      // TikTok Scraper - for hashtags, trends, search
      actorInput = {
        hashtags: input.hashtags || [],
        profiles: input.profiles || [],
        resultsLimit: resultsLimit || 50,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
      };
    } else if (scraperType === 'profile') {
      // Profile Scraper
      actorInput = {
        profiles: Array.isArray(input) ? input : [input],
        resultsLimit: resultsLimit || 100,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
      };
    } else if (scraperType === 'video') {
      // Video Scraper
      actorInput = {
        postURLs: Array.isArray(input) ? input : [input],
        resultsLimit: resultsLimit || 100,
      };
    }

    console.log(`Starting TikTok ${scraperType} scrape:`, actorInput);

    // Run the Actor and wait for it to finish
    const run = await client.actor(actorId).call(actorInput);

    // Fetch Actor results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      return NextResponse.json({
        error: 'No data found'
      }, { status: 404 });
    }

    // Save to Firestore
    if (adminDb) {
      const timestamp = new Date().toISOString();
      const docRef = await adminDb.collection('tiktok_scrapes').add({
        userId,
        scraperType,
        input,
        resultsCount: items.length,
        data: items,
        scrapedAt: timestamp,
        runId: run.id,
      });

      console.log('Saved to Firestore with ID:', docRef.id);
    }

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
      message: `Successfully scraped ${items.length} items`,
    });

  } catch (error: unknown) {
    console.error('Error scraping TikTok:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to scrape TikTok', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve saved scrapes
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const scraperType = searchParams.get('scraperType');

    // Build query
    let query = adminDb
      .collection('tiktok_scrapes')
      .where('userId', '==', userId);

    if (scraperType) {
      query = query.where('scraperType', '==', scraperType);
    }

    const snapshot = await query
      .orderBy('scrapedAt', 'desc')
      .limit(50)
      .get();

    const scrapes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      scrapes,
    });

  } catch (error: unknown) {
    console.error('Error fetching TikTok scrapes:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch scrapes', details: errorMessage },
      { status: 500 }
    );
  }
}
