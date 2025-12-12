import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';

const POSTBRIDGE_API_URL = 'https://api.post-bridge.com/v1';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      caption,
      socialAccounts,
      scheduledAt,
      media,
      mediaUrls,
      isDraft,
      platformOverrides,
    } = body;

    if (!caption || !socialAccounts || socialAccounts.length === 0) {
      return NextResponse.json({
        error: 'Caption and at least one social account are required'
      }, { status: 400 });
    }

    const postbridgeToken = process.env.POSTBRIDGE_API_TOKEN;
    if (!postbridgeToken || postbridgeToken === 'your_postbridge_token_here') {
      return NextResponse.json({
        error: 'PostBridge API token not configured. Please add your token to .env.local'
      }, { status: 500 });
    }

    // Prepare post data
    const postData: Record<string, unknown> = {
      caption,
      social_accounts: socialAccounts,
      is_draft: isDraft || false,
    };

    if (scheduledAt) {
      postData.scheduled_at = scheduledAt;
    }

    if (media && media.length > 0) {
      postData.media = media;
    }

    if (mediaUrls && mediaUrls.length > 0) {
      postData.media_urls = mediaUrls;
    }

    if (platformOverrides) {
      // Add platform-specific overrides
      Object.assign(postData, platformOverrides);
    }

    console.log('Creating post with data:', postData);

    const response = await fetch(`${POSTBRIDGE_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${postbridgeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to create post',
        details: data
      }, { status: response.status });
    }

    // Save post record to Firestore
    if (adminDb) {
      const timestamp = new Date().toISOString();
      await adminDb.collection('postbridge_posts').add({
        userId,
        postId: data.id || data.data?.id,
        caption,
        socialAccounts,
        scheduledAt: scheduledAt || null,
        isDraft,
        createdAt: timestamp,
        status: isDraft ? 'draft' : (scheduledAt ? 'scheduled' : 'processing'),
      });
    }

    return NextResponse.json({
      success: true,
      post: data,
      message: isDraft ? 'Post saved as draft' : (scheduledAt ? 'Post scheduled successfully' : 'Post is being processed'),
    });

  } catch (error: unknown) {
    console.error('Error creating post:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to create post', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET posts
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
    const status = searchParams.get('status');

    // Build URL with query parameters
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (status) params.append('status', status);

    const url = `${POSTBRIDGE_API_URL}/posts${params.toString() ? `?${params.toString()}` : ''}`;

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
        error: 'Failed to fetch posts',
        details: data
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      posts: data.data || data,
    });

  } catch (error: unknown) {
    console.error('Error fetching posts:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch posts', details: errorMessage },
      { status: 500 }
    );
  }
}
