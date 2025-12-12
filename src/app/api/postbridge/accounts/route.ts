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
        error: 'PostBridge API token not configured. Please add your token to .env.local'
      }, { status: 500 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const username = searchParams.get('username');

    // Build URL with query parameters
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (username) params.append('username', username);

    const url = `${POSTBRIDGE_API_URL}/social-accounts${params.toString() ? `?${params.toString()}` : ''}`;

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
        error: 'Failed to fetch social accounts',
        details: data
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      accounts: data.data || data,
    });

  } catch (error: unknown) {
    console.error('Error fetching social accounts:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch social accounts', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET specific account by ID
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({
        error: 'Account ID is required'
      }, { status: 400 });
    }

    const postbridgeToken = process.env.POSTBRIDGE_API_TOKEN;
    if (!postbridgeToken || postbridgeToken === 'your_postbridge_token_here') {
      return NextResponse.json({
        error: 'PostBridge API token not configured'
      }, { status: 500 });
    }

    const response = await fetch(`${POSTBRIDGE_API_URL}/social-accounts/${accountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${postbridgeToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to fetch account',
        details: data
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      account: data,
    });

  } catch (error: unknown) {
    console.error('Error fetching account:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch account', details: errorMessage },
      { status: 500 }
    );
  }
}
