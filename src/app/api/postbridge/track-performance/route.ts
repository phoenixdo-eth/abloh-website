import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApifyClient } from 'apify-client';

const POSTBRIDGE_API_URL = 'https://api.post-bridge.com/v1';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postResultId, platform, postUrl } = body;

    if (!postUrl || !platform) {
      return NextResponse.json({
        error: 'Post URL and platform are required'
      }, { status: 400 });
    }

    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken || apifyToken === 'your_apify_token_here') {
      return NextResponse.json({
        error: 'Apify API token not configured'
      }, { status: 500 });
    }

    const client = new ApifyClient({ token: apifyToken });

    let actorId: string;
    let input: Record<string, unknown>;
    let performanceData: Record<string, unknown> = {};

    if (platform.toLowerCase() === 'instagram') {
      // Use Instagram scraper
      actorId = 'apify/instagram-api-scraper';
      input = {
        startUrls: [postUrl],
        resultsLimit: 1,
      };

      console.log('Scraping Instagram post:', postUrl);

      const run = await client.actor(actorId).call(input);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      if (items && items.length > 0) {
        const post = items[0] as Record<string, unknown>;
        performanceData = {
          likes: post.likesCount || 0,
          comments: post.commentsCount || 0,
          views: post.videoViewCount || 0,
          timestamp: new Date().toISOString(),
        };
      }

    } else if (platform.toLowerCase() === 'tiktok') {
      // Use TikTok video scraper
      actorId = 'clockworks/tiktok-video-scraper';
      input = {
        postURLs: [postUrl],
        resultsLimit: 1,
      };

      console.log('Scraping TikTok post:', postUrl);

      const run = await client.actor(actorId).call(input);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      if (items && items.length > 0) {
        const post = items[0] as Record<string, unknown>;
        performanceData = {
          likes: post.diggCount || 0,
          comments: post.commentCount || 0,
          shares: post.shareCount || 0,
          views: post.playCount || 0,
          timestamp: new Date().toISOString(),
        };
      }
    } else {
      return NextResponse.json({
        error: 'Unsupported platform. Only Instagram and TikTok are supported.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      platform,
      postUrl,
      performance: performanceData,
      message: 'Performance data scraped successfully',
    });

  } catch (error: unknown) {
    console.error('Error tracking post performance:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to track post performance', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all tracked performance data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postbridgeToken = process.env.POSTBRIDGE_API_TOKEN;
    if (!postbridgeToken || postbridgeToken === 'your_postbridge_token_here') {
      return NextResponse.json({
        error: 'PostBridge API token not configured'
      }, { status: 500 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');

    // Build URL with query parameters
    const params = new URLSearchParams();
    if (postId) params.append('post_id', postId);

    const url = `${POSTBRIDGE_API_URL}/post-results${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${postbridgeToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to fetch post results',
        details: data
      }, { status: response.status });
    }

    const results = data.data || data;

    // Filter only successful posts with URLs
    const successfulPosts = Array.isArray(results)
      ? results.filter((result: Record<string, unknown>) =>
          result.success && result.url
        )
      : [];

    return NextResponse.json({
      success: true,
      results: successfulPosts,
      message: `Found ${successfulPosts.length} posts ready for performance tracking`,
    });

  } catch (error: unknown) {
    console.error('Error fetching trackable posts:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch trackable posts', details: errorMessage },
      { status: 500 }
    );
  }
}
