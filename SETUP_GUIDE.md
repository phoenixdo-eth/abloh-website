# Abloh Website - Setup Guide

## Accessing the Dashboard

### For New Users (First Time)

1. **Visit the Homepage**: Go to `http://localhost:3000` (or your deployed URL)
2. **Click LOGIN**: In the top-right corner, click the "LOGIN" button
3. **Sign Up/Sign In**: Complete the Clerk authentication flow
4. **Automatic Redirect**: After successful sign-in, you'll be automatically redirected to `/dashboard`

### For Returning Users (Already Signed In)

If you're already signed in and on the homepage:

1. **Click DASHBOARD button**: In the top-right corner (next to your avatar), click the "DASHBOARD" button
2. Or **Navigate directly**: Go to `http://localhost:3000/dashboard`

### Dashboard Navigation

Once in the dashboard, you have access to:

- **Dashboard** - Overview with stats and recent campaigns
- **Analytics** - Performance analytics (coming soon)
- **Campaigns** - Manage UGC campaigns (coming soon)
- **Social Media** - Post to TikTok and Instagram via PostBridge
- **Content Calendar** - Visual calendar of scheduled posts
- **Instagram Scraper** - Scrape Instagram profiles for research
- **TikTok Scraper** - Scrape TikTok content (hashtags, profiles, videos)
- **AI Generator** - Generate images/videos with Runway and Kie AI
- **Team** - Team management (coming soon)
- **Settings** - Account settings (coming soon)

## Environment Configuration

### Required for Full Functionality

Update your `.env.local` file with actual API tokens:

```env
# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Apify API (Required for Instagram/TikTok scrapers)
APIFY_API_TOKEN=your_actual_apify_token

# Runway AI (Required for AI image/video generation)
RUNWAY_API_KEY=your_actual_runway_key

# Kie AI (Required for AI content generation)
KIE_API_KEY=your_actual_kie_key

# PostBridge API (Required for social media posting)
POSTBRIDGE_API_TOKEN=your_actual_postbridge_token
```

### Getting API Tokens

1. **Apify** - https://console.apify.com/account/integrations
   - Sign up for free account
   - Navigate to Integrations
   - Generate API token
   - Copy to `.env.local`

2. **Runway** - https://app.runwayml.com/settings/api-keys
   - Create account
   - Go to Settings > API Keys
   - Generate new key
   - Copy to `.env.local`

3. **Kie AI** - https://kie.ai/dashboard/api-keys
   - Sign up for account
   - Access dashboard
   - Generate API key
   - Copy to `.env.local`

4. **PostBridge** - https://app.post-bridge.com/settings/api
   - Create account
   - Connect your social media accounts (TikTok, Instagram)
   - Generate API token
   - Copy to `.env.local`

### Creating Abloh-Specific Services

Currently using temporary credentials from `era-website`. To fully set up Abloh:

#### 1. Create Clerk Application

1. Go to https://clerk.com/
2. Create new application named "Abloh"
3. Copy publishable key and secret key
4. Update `.env.local` with new keys

#### 2. Create Firebase Project (Optional)

If you want separate Firebase instance:

1. Go to https://console.firebase.google.com/
2. Create new project named "abloh-website"
3. Enable Firestore Database
4. Create service account key
5. Update `.env.local` with new credentials

## Running the Application

### Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Testing Features

1. **Instagram Scraper**
   - Go to `/dashboard/instagram`
   - Enter Instagram profile URL
   - Click "Scrape Profile"
   - View results in table

2. **TikTok Scraper**
   - Go to `/dashboard/tiktok`
   - Choose mode: Hashtags, Profiles, or Videos
   - Enter search criteria
   - Apply filters (min likes, views, etc.)
   - View results in data table

3. **AI Generator**
   - Go to `/dashboard/ai-generator`
   - Select model (Runway or Kie)
   - Enter prompt
   - For image-to-video: provide image URL
   - Click "Generate"
   - View results and download

4. **Social Media Manager**
   - Go to `/dashboard/social-media`
   - Click "Create Post"
   - Enter caption
   - Select accounts (must connect via PostBridge first)
   - Upload media (optional)
   - Schedule or post immediately

5. **Content Calendar**
   - Go to `/dashboard/calendar`
   - View scheduled posts on calendar
   - Click dates to see post details
   - View upcoming posts list

## PostBridge Account Setup

**Important:** Before using Social Media posting features:

1. Sign up at https://app.post-bridge.com/
2. Connect your TikTok account via OAuth
3. Connect your Instagram account via OAuth
4. Generate API token
5. Add token to `.env.local`

PostBridge handles the OAuth flow for social media accounts, so you don't need to configure that separately.

## Troubleshooting

### "Unauthorized" Errors

- Make sure you're signed in via Clerk
- Check that Clerk keys in `.env.local` are correct
- Clear browser cache and cookies

### "API token not configured" Errors

- Verify the specific API token is set in `.env.local`
- Restart development server after updating `.env.local`
- Check token format (no quotes, no extra spaces)

### "Failed to scrape" Errors

- Verify Apify API token is valid
- Check you have sufficient Apify credits
- Ensure the URL format is correct
- Check network connection

### Dashboard Not Loading

- Check console for errors
- Verify all environment variables are set
- Restart development server
- Clear Next.js cache: `rm -rf .next`

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors: `npx tsc --noEmit`
- Clear node_modules: `rm -rf node_modules && npm install`

## Features Checklist

### ✅ Implemented
- [x] Clerk authentication with protected routes
- [x] Dashboard homepage with stats
- [x] Instagram profile scraper with Apify
- [x] TikTok content scraper (hashtags, profiles, videos)
- [x] AI content generator (Runway + Kie)
- [x] Social media posting via PostBridge
- [x] Content calendar with scheduled posts
- [x] Data tables with sorting/filtering
- [x] Responsive design

### 🚧 Coming Soon
- [ ] Analytics dashboard
- [ ] Campaign management
- [ ] Team collaboration
- [ ] Post performance tracking integration
- [ ] Drag-and-drop calendar rescheduling
- [ ] Post editing from calendar
- [ ] Advanced filters and search

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── instagram/scrape/     # Instagram scraper endpoint
│   │   ├── tiktok/scrape/         # TikTok scraper endpoint
│   │   ├── runway/generate/       # Runway AI endpoint
│   │   ├── kie/generate/          # Kie AI endpoint
│   │   └── postbridge/
│   │       ├── accounts/          # Get social accounts
│   │       ├── posts/             # Create/list posts
│   │       ├── media/             # Upload media
│   │       ├── results/           # Get post results
│   │       └── track-performance/ # Track post performance
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── instagram/            # Instagram scraper UI
│   │   ├── tiktok/               # TikTok scraper UI
│   │   ├── ai-generator/         # AI generator UI
│   │   ├── social-media/         # Social posting UI
│   │   └── calendar/             # Content calendar UI
│   └── page.tsx                   # Homepage
├── components/
│   ├── ui/                        # SHADCN components
│   └── Navigation.tsx             # Top navigation
├── lib/
│   └── firebase/                  # Firebase config
└── middleware.ts                  # Route protection

```

## Support

For issues or questions:
- Check documentation in project root (`.md` files)
- Review API documentation links in `.env.local`
- Create issue on GitHub (if applicable)

## Next Steps

1. ✅ Get all API tokens and update `.env.local`
2. ✅ Create Abloh-specific Clerk application
3. ✅ (Optional) Create separate Firebase project
4. ✅ Connect social media accounts in PostBridge
5. ✅ Test all features to ensure they work
6. ✅ Start creating content!
