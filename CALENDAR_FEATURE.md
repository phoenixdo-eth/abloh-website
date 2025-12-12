# Content Calendar Feature

## Overview

The Content Calendar provides a visual interface to view and manage all scheduled social media posts in a calendar view. This makes it easy to see your content schedule at a glance and plan future posts.

## Features

### 1. Calendar View
- **Interactive Calendar**: Click on any date to view posts scheduled for that day
- **Visual Indicators**: Dates with scheduled posts are highlighted with a special background color
- **Post Count Badges**: (Future enhancement) Shows the number of posts scheduled on each date

### 2. Date Selection
- Click on a date to see all posts scheduled for that day
- Selected date is highlighted
- Shows detailed list of posts in the sidebar

### 3. Scheduled Posts Display

**For Selected Date:**
- Time of posting
- Post caption (truncated)
- Status badge (Scheduled, Posted, Processing, Failed)
- Number of accounts the post will be sent to

**Upcoming Posts List:**
- Shows next 10 upcoming scheduled posts in chronological order
- Full date and time information
- Status indicators
- Quick actions (Edit, Delete) - Coming soon

### 4. Post Management
- **Quick Create**: "New Post" button in sidebar takes you to Social Media Manager
- **Schedule New Post**: Direct link from empty state to create posts

## Page Location

`/dashboard/calendar`

## Navigation

The Content Calendar is accessible from:
- Dashboard sidebar under "Content Calendar"
- Available on all dashboard pages

## How It Works

### Fetching Scheduled Posts

The calendar automatically fetches all scheduled posts from the PostBridge API:

```typescript
const response = await fetch('/api/postbridge/posts?status=scheduled');
```

This queries the PostBridge API with a status filter to get only scheduled posts.

### Date Highlighting

Dates with scheduled posts are highlighted using react-day-picker modifiers:

```typescript
const modifiers = {
  scheduled: getDatesWithPosts(),
};

const modifiersClassNames = {
  scheduled: "bg-primary/20 font-bold",
};
```

The `getDatesWithPosts()` function extracts all unique dates from scheduled posts and returns them as an array of Date objects.

### Post Filtering

When a date is selected, the calendar filters posts to show only those scheduled for that specific date:

```typescript
const updateSelectedDatePosts = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0];
  const postsForDate = posts
    .filter(post => {
      if (!post.scheduled_at) return false;
      const postDate = new Date(post.scheduled_at).toISOString().split('T')[0];
      return postDate === dateStr;
    })
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

  setSelectedDatePosts(postsForDate);
};
```

## UI Components

### Calendar Card (Left Side)
- SHADCN Calendar component
- Month/year navigation
- Date selection
- Visual highlighting for dates with posts

### Daily Posts Card (Right Side)
- Shows selected date
- List of posts for that date
- Post count indicator
- Empty state with "Schedule a post" CTA

### Upcoming Posts Card (Bottom)
- Shows next 10 scheduled posts
- Sorted by date/time
- Status indicators
- Edit/Delete actions (Coming soon)

## Status Indicators

Posts display different status badges:

| Status | Badge Color | Icon | Description |
|--------|-------------|------|-------------|
| Scheduled | Secondary (blue) | Clock | Post is scheduled for future |
| Posted | Default (primary) | CheckCircle | Post has been published |
| Processing | Outline (yellow) | Loader | Post is being processed |
| Failed | Destructive (red) | XCircle | Post failed to publish |
| Draft | Outline (gray) | Clock | Saved as draft |

## User Workflow

### Viewing Schedule

1. Navigate to `/dashboard/calendar`
2. Calendar loads with current month
3. Dates with scheduled posts are highlighted
4. Click on any date to see posts for that day

### Creating New Post

1. Click "New Post" button in sidebar
2. Redirects to `/dashboard/social-media`
3. Create and schedule post
4. Return to calendar to see it scheduled

### Managing Posts

**Current:**
- View all scheduled posts
- See post details (caption, time, accounts)
- Check post status

**Coming Soon:**
- Edit scheduled posts
- Delete/cancel scheduled posts
- Reschedule posts via drag-and-drop
- Quick post preview

## Technical Implementation

### Data Structure

```typescript
interface Post {
  id: string;
  caption: string;
  status: string;
  scheduled_at?: string;  // ISO datetime string
  created_at: string;
  social_accounts: number[];
  platform?: string;
}

interface ScheduledPost extends Post {
  scheduledDate: Date;  // Parsed Date object
}
```

### Key Functions

**getPostCountForDate(date: Date): number**
- Returns count of posts scheduled for a specific date
- Used for badge display (future enhancement)

**getDatesWithPosts(): Date[]**
- Returns array of all dates that have scheduled posts
- Used for calendar highlighting

**updateSelectedDatePosts(date: Date)**
- Filters posts for selected date
- Sorts by time
- Updates UI

**formatTime(date: Date): string**
- Formats time as "HH:MM AM/PM"
- Used for post time display

### Calendar Modifiers

The calendar uses react-day-picker's modifier system:

```typescript
modifiers={{
  scheduled: [array of dates with posts]
}}

modifiersClassNames={{
  scheduled: "bg-primary/20 font-bold"
}}
```

This applies the custom styling to dates with scheduled posts.

## Future Enhancements

### Short Term
1. **Post Count Badges**: Show number of posts on each calendar date
2. **Edit Functionality**: Edit scheduled posts directly from calendar
3. **Delete Functionality**: Cancel/delete scheduled posts
4. **Post Preview**: Click to see full post details in modal

### Medium Term
1. **Drag & Drop**: Reschedule posts by dragging to different dates
2. **Multi-Select**: Select multiple posts for bulk actions
3. **Filters**: Filter by platform, account, status
4. **Search**: Search posts by caption or hashtags

### Long Term
1. **Week/Month/Day Views**: Toggle between calendar views
2. **Recurring Posts**: Schedule repeating posts
3. **Analytics Integration**: Show performance metrics on calendar
4. **Team Collaboration**: See who scheduled each post
5. **Conflict Detection**: Warn about too many posts on same day/time

## Styling

The calendar uses:
- SHADCN Calendar component with custom theme
- Tailwind CSS for styling
- Custom modifiers for date highlighting
- Responsive grid layout

### Color Scheme

- **Highlighted Dates**: `bg-primary/20` with bold text
- **Selected Date**: Standard SHADCN selected state
- **Today**: `bg-accent` with accent text
- **Status Badges**: Variant-based colors (see Status Indicators table)

## Integration with Other Features

### Social Media Manager
- "New Post" button links to Social Media Manager
- Posts created there appear in calendar automatically

### PostBridge API
- Fetches posts with `status=scheduled` filter
- Real-time updates when posts are scheduled
- Status updates reflect in calendar

### Firebase
- Posts stored in Firestore `postbridge_posts` collection
- User-specific filtering via Clerk userId

## Error Handling

- Loading states during data fetch
- Empty states when no posts scheduled
- Error messages for API failures
- Graceful handling of missing data

## Performance Considerations

- Posts fetched once on page load
- Client-side filtering for date selection
- Efficient date comparison using ISO strings
- Lazy loading for future enhancement

## Accessibility

- Keyboard navigation for calendar
- Screen reader support via SHADCN components
- Focus management
- Semantic HTML structure

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile/tablet
- Touch-friendly interactions
- Fallback for unsupported features
