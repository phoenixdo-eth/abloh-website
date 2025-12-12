import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const POSTBRIDGE_API_URL = 'https://api.post-bridge.com/v1';

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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');
    const platform = searchParams.get('platform');

    // Build URL with query parameters
    const params = new URLSearchParams();
    if (postId) params.append('post_id', postId);
    if (platform) params.append('platform', platform);

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

    // For each successful result, we could fetch performance metrics from scrapers
    // This would require the post URLs to be scraped using the existing Instagram/TikTok scrapers
    // For now, we'll just return the PostBridge results

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error: unknown) {
    console.error('Error fetching post results:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch post results', details: errorMessage },
      { status: 500 }
    );
  }
}
