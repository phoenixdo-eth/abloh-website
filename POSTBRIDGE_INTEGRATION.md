# PostBridge API Integration

This document explains the PostBridge API integration for social media posting and performance tracking.

## Overview

The PostBridge integration allows users to:
- Connect TikTok and Instagram accounts
- Create and schedule posts to multiple accounts
- Upload media (images/videos)
- Track post performance using Apify scrapers
- View posting history and results

## Setup

### 1. Environment Variables

Add your PostBridge API token to `.env.local`:

```env
POSTBRIDGE_API_TOKEN=your_actual_postbridge_token_here
```

**Note:** You also need the Apify API token configured for performance tracking:
```env
APIFY_API_TOKEN=your_actual_apify_token_here
```

### 2. Account Connection

Before using the platform, you need to connect your social media accounts via PostBridge. This requires OAuth authentication which is handled by PostBridge's dashboard.

## API Endpoints

### Account Management

#### GET `/api/postbridge/accounts`
Retrieve connected social media accounts.

**Query Parameters:**
- `platform` (optional): Filter by platform (instagram, tiktok)
- `username` (optional): Filter by username

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": 123,
      "platform": "instagram",
      "username": "myaccount",
      "avatar_url": "https://...",
      "is_active": true
    }
  ]
}
```

#### POST `/api/postbridge/accounts`
Get a specific account by ID.

**Request Body:**
```json
{
  "accountId": 123
}
```

### Media Management

#### POST `/api/postbridge/media`
Create an upload URL for media files.

**Request Body:**
```json
{
  "fileName": "video.mp4",
  "mimeType": "video/mp4"
}
```

**Supported MIME Types:**
- `image/png`
- `image/jpeg`
- `video/mp4`
- `video/quicktime`

**Response:**
```json
{
  "success": true,
  "mediaId": "media_abc123",
  "uploadUrl": "https://signed-upload-url...",
  "message": "Upload URL created successfully. Use PUT request to upload file."
}
```

**Upload Process:**
1. Call POST `/api/postbridge/media` to get upload URL
2. Upload file to the returned URL using PUT request
3. Use the returned `mediaId` when creating posts

#### GET `/api/postbridge/media`
List uploaded media.

**Query Parameters:**
- `post_id` (optional): Filter by post ID
- `type` (optional): Filter by media type

### Post Management

#### POST `/api/postbridge/posts`
Create a new post to social media accounts.

**Request Body:**
```json
{
  "caption": "My post caption #hashtag",
  "socialAccounts": [123, 456],
  "scheduledAt": "2025-12-15T10:00:00Z",
  "media": ["media_abc123"],
  "isDraft": false,
  "platformOverrides": {
    "instagram": {
      "caption": "Custom Instagram caption"
    },
    "tiktok": {
      "caption": "Custom TikTok caption",
      "is_aigc": true
    }
  }
}
```

**Required Fields:**
- `caption`: Post caption/text
- `socialAccounts`: Array of account IDs to post to

**Optional Fields:**
- `scheduledAt`: ISO datetime string for scheduling (null for immediate posting)
- `media`: Array of media IDs from upload
- `mediaUrls`: Alternative to media - array of public URLs
- `isDraft`: Save as draft without processing
- `platformOverrides`: Platform-specific customization

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "post_123",
    "status": "processing"
  },
  "message": "Post is being processed"
}
```

#### GET `/api/postbridge/posts`
List all posts.

**Query Parameters:**
- `platform` (optional): Filter by platform
- `status` (optional): Filter by status (posted, scheduled, processing)

### Post Results

#### GET `/api/postbridge/results`
Get posting results and status.

**Query Parameters:**
- `post_id` (optional): Filter by post ID
- `platform` (optional): Filter by platform

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "result_123",
      "post_id": "post_123",
      "platform": "instagram",
      "success": true,
      "url": "https://instagram.com/p/abc123/",
      "username": "myaccount"
    }
  ]
}
```

### Performance Tracking

#### POST `/api/postbridge/track-performance`
Track performance of a posted content using Apify scrapers.

**Request Body:**
```json
{
  "postResultId": "result_123",
  "platform": "instagram",
  "postUrl": "https://instagram.com/p/abc123/"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "instagram",
  "postUrl": "https://instagram.com/p/abc123/",
  "performance": {
    "likes": 150,
    "comments": 25,
    "views": 1200,
    "timestamp": "2025-12-11T10:00:00Z"
  },
  "message": "Performance data scraped successfully"
}
```

**Tracked Metrics:**

Instagram:
- `likes`: Like count
- `comments`: Comment count
- `views`: Video view count (if video)

TikTok:
- `likes`: Like count (diggCount)
- `comments`: Comment count
- `shares`: Share count
- `views`: Play count

#### GET `/api/postbridge/track-performance`
Get all posts ready for performance tracking (successful posts with URLs).

## UI Components

### Social Media Manager Page

Location: `/dashboard/social-media`

Features:
- **Connected Accounts Section**: View all connected TikTok and Instagram accounts
- **Create Post Dialog**:
  - Caption input with multi-line support
  - Account selection (multiple accounts)
  - Media upload (images/videos)
  - Scheduling options
  - Draft mode
- **Post History**: View all created posts with status and scheduling info

### Navigation

The Social Media page is accessible from the main dashboard sidebar under "Social Media".

## Workflow

### Creating a Post

1. Navigate to `/dashboard/social-media`
2. Click "Create Post" button
3. Enter your caption
4. Select target accounts (can select multiple)
5. (Optional) Upload media files
6. (Optional) Set scheduling time
7. Click "Post Now" / "Schedule Post" / "Save Draft"

### Uploading Media

The media upload process is handled automatically:
1. Select files in the Create Post dialog
2. When you submit, files are uploaded in sequence
3. Each file gets a signed upload URL
4. Files are uploaded to PostBridge storage
5. Media IDs are attached to the post

### Tracking Performance

1. After a post is published, get the post URL from post results
2. Call the track-performance endpoint with the URL
3. The system uses Apify scrapers to get current metrics
4. Performance data includes likes, comments, views, shares (TikTok)

### Scheduled Posts

- Posts scheduled for future times appear with "Scheduled" status
- The scheduled time is displayed in the post history
- PostBridge handles the actual posting at the scheduled time

## Database Integration

Posts are saved to Firebase Firestore in the `postbridge_posts` collection with:
- `userId`: Clerk user ID
- `postId`: PostBridge post ID
- `caption`: Post caption
- `socialAccounts`: Array of account IDs
- `scheduledAt`: Scheduled time (if applicable)
- `isDraft`: Draft status
- `createdAt`: Creation timestamp
- `status`: Current status (draft, scheduled, processing, posted)

## Integration with Existing Scrapers

The performance tracking integrates with existing Instagram and TikTok scrapers:

- **Instagram**: Uses `apify/instagram-api-scraper` to get post metrics
- **TikTok**: Uses `clockworks/tiktok-video-scraper` to get video metrics

This allows you to:
1. Post content via PostBridge
2. Track performance using the same scrapers you use for research
3. Build analytics dashboards combining posted and researched content

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common errors:
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Missing required parameters
- `500 Internal Server Error`: API token not configured or API call failed

## Next Steps

1. **Get PostBridge API Token**: Sign up at PostBridge and get your API token
2. **Connect Accounts**: Use PostBridge dashboard to connect your social media accounts via OAuth
3. **Update Environment**: Add `POSTBRIDGE_API_TOKEN` to `.env.local`
4. **Start Posting**: Create your first post from `/dashboard/social-media`
5. **Track Performance**: Use the track-performance endpoint to monitor your posts

## Notes

- PostBridge handles OAuth authentication for social media accounts
- Account connection must be done through PostBridge's dashboard
- Performance tracking requires Apify API token
- Media files are stored on PostBridge's servers
- Video processing may take some time depending on file size
- TikTok has a 3GB file size limit per video
- Instagram supports various content types (feed posts, reels, stories)

## Security Considerations

- API tokens are stored in environment variables (not committed to git)
- All endpoints require Clerk authentication
- Firebase security rules should be configured to restrict access
- Media upload URLs are signed and time-limited
- User data is associated with Clerk user ID for multi-tenancy
