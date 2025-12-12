# Abloh Website TODO

## Authentication
- [ ] **IMPORTANT: Create dedicated Clerk application for Abloh**
  - Currently using Clerk keys from `era-website` project
  - Go to https://dashboard.clerk.com
  - Create a new application named "Abloh Website"
  - Copy the new API keys to `.env.local`
  - This will ensure users are separate from the era-website application

## API Integrations Configuration

### Instagram Scraper (Apify)
- [ ] **Set up Apify account and get API token**
  - Go to https://console.apify.com/account/integrations
  - Create an account or sign in
  - Copy your API token
  - Add it to `.env.local` as `APIFY_API_TOKEN`
  - Note: The Instagram API scraper is a pay-per-result service

### AI Content Generation

#### Runway AI
- [ ] **Set up Runway account and get API key**
  - Go to https://app.runwayml.com/settings/api-keys
  - Create an account or sign in
  - Generate an API key
  - Add it to `.env.local` as `RUNWAY_API_KEY`
  - Note: Pricing varies by model (e.g., $0.08 per Gen-4 image)

#### Kie AI
- [ ] **Set up Kie account and get API key**
  - Go to https://kie.ai/dashboard/api-keys
  - Create an account or sign in
  - Copy your API token
  - Add it to `.env.local` as `KIE_API_KEY`
  - Note: Uses points-based pricing model

- [ ] **Optional: Create dedicated Firebase project for Abloh**
  - Currently using Firebase from `era-website` project
  - Go to https://console.firebase.google.com
  - Create a new project named "Abloh Website"
  - Set up Firestore database
  - Copy configuration to `.env.local`

## Future Enhancements
- [ ] Complete dashboard functionality
- [ ] Add user profile management
- [ ] Implement campaign creation workflow
- [ ] Add export functionality for scraped Instagram data (CSV, JSON)
- [ ] Add filters and search for scraped profiles
- [ ] Implement pagination for large datasets
