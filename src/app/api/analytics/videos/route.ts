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
    const platform = searchParams.get('platform');
    const timeRange = searchParams.get('timeRange') || '30d';

    // Fetch post results from PostBridge
    const response = await fetch(`${POSTBRIDGE_API_URL}/post-results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${postbridgeToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        error: 'Failed to fetch post data',
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    let posts = data.data || data;

    // Ensure posts is an array
    if (!Array.isArray(posts)) {
      posts = [];
    }

    // Filter successful posts with URLs
    const successfulPosts = posts.filter((post: Record<string, unknown>) =>
      post.success && post.url
    );

    // Calculate time range filter
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Filter by time range and platform
    const filteredPosts = successfulPosts.filter((post: Record<string, unknown>) => {
      const postDate = post.posted_at ? new Date(post.posted_at as string) : new Date();
      const matchesTimeRange = postDate >= startDate;
      const matchesPlatform = !platform || platform === 'all' || post.platform === platform;

      return matchesTimeRange && matchesPlatform;
    });

    // Transform posts into analytics format
    const videos = filteredPosts.map((post: Record<string, unknown>) => {
      // Extract performance metrics
      const performance = post.performance as Record<string, unknown> || {};
      const metadata = post.metadata as Record<string, unknown> || {};

      return {
        id: post.id || post.post_id || String(Math.random()),
        title: metadata.caption || metadata.text || post.caption || 'Untitled Video',
        platform: post.platform || 'unknown',
        publishedAt: post.posted_at || post.created_at || new Date().toISOString(),
        thumbnailUrl: metadata.thumbnail || metadata.cover || undefined,
        url: post.url as string,
        views: Number(performance.views || 0),
        likes: Number(performance.likes || 0),
        comments: Number(performance.comments || 0),
        shares: Number(performance.shares || 0),
        saves: Number(performance.saves || 0),
        engagementRate: calculateEngagementRate(
          Number(performance.likes || 0),
          Number(performance.comments || 0),
          Number(performance.shares || 0),
          Number(performance.views || 0)
        ),
        viewsTrend: Number(performance.viewsTrend || 0),
      };
    });

    // Calculate aggregate stats
    const stats = {
      totalVideos: videos.length,
      totalViews: videos.reduce((sum: number, v: any) => sum + v.views, 0),
      totalLikes: videos.reduce((sum: number, v: any) => sum + v.likes, 0),
      totalComments: videos.reduce((sum: number, v: any) => sum + v.comments, 0),
      totalShares: videos.reduce((sum: number, v: any) => sum + v.shares, 0),
      avgEngagement: videos.length > 0
        ? videos.reduce((sum: number, v: any) => sum + v.engagementRate, 0) / videos.length
        : 0,
      platformBreakdown: {
        instagram: videos.filter((v: any) => v.platform === 'instagram').length,
        tiktok: videos.filter((v: any) => v.platform === 'tiktok').length,
      }
    };

    return NextResponse.json({
      success: true,
      videos,
      stats,
      timeRange,
      platform: platform || 'all',
    });

  } catch (error: unknown) {
    console.error('Error fetching analytics:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: errorMessage },
      { status: 500 }
    );
  }
}

function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  views: number
): number {
  if (views === 0) return 0;
  const totalEngagement = likes + comments + shares;
  return (totalEngagement / views) * 100;
}
