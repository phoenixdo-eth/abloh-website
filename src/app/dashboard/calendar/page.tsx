"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar as BigCalendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Instagram,
  Video,
  Share2,
  Plus,
} from "lucide-react";

const localizer = momentLocalizer(moment);

interface Post {
  id: string;
  caption: string;
  status: string;
  scheduled_at?: string;
  created_at: string;
  social_accounts: number[];
  platform?: string;
}

interface ScheduledPost extends Post {
  scheduledDate: Date;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>('month');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedDatePosts, setSelectedDatePosts] = useState<ScheduledPost[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      updateSelectedDatePosts(selectedDate);
    }
  }, [selectedDate, posts]);

  const fetchScheduledPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await fetch('/api/postbridge/posts?status=scheduled');
      const result = await response.json();

      if (result.success) {
        setPosts(result.posts || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const updateSelectedDatePosts = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const postsForDate = posts
      .filter(post => {
        if (!post.scheduled_at) return false;
        const postDate = new Date(post.scheduled_at).toISOString().split('T')[0];
        return postDate === dateStr;
      })
      .map(post => ({
        ...post,
        scheduledDate: new Date(post.scheduled_at!),
      }))
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

    setSelectedDatePosts(postsForDate);
  };

  const getPostCountForDate = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter(post => {
      if (!post.scheduled_at) return false;
      const postDate = new Date(post.scheduled_at).toISOString().split('T')[0];
      return postDate === dateStr;
    }).length;
  };

  const getDatesWithPosts = (): Date[] => {
    const dates = new Set<string>();
    posts.forEach(post => {
      if (post.scheduled_at) {
        const dateStr = new Date(post.scheduled_at).toISOString().split('T')[0];
        dates.add(dateStr);
      }
    });
    return Array.from(dates).map(dateStr => new Date(dateStr));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      posted: 'default',
      scheduled: 'secondary',
      processing: 'outline',
      failed: 'destructive',
      draft: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPlatformIcon = (platform?: string) => {
    if (!platform) return <Share2 className="h-4 w-4" />;

    switch (platform.toLowerCase()) {
      case 'tiktok':
        return <Video className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'posted':
        return '#22c55e'; // green
      case 'scheduled':
        return '#3b82f6'; // blue
      case 'processing':
        return '#eab308'; // yellow
      case 'failed':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  // Transform posts into calendar events
  const calendarEvents = useMemo(() => {
    return posts
      .filter(post => post.scheduled_at)
      .map(post => {
        const start = new Date(post.scheduled_at!);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
        return {
          id: post.id,
          title: post.caption.substring(0, 50) + (post.caption.length > 50 ? '...' : ''),
          start,
          end,
          resource: post,
        };
      });
  }, [posts]);

  const handleSelectEvent = (event: { resource: Post }) => {
    const post = event.resource;
    if (post && post.scheduled_at) {
      const date = new Date(post.scheduled_at);
      setSelectedDate(date);
      setShowDetailsDialog(true);
    }
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; action: string }) => {
    setSelectedDate(slotInfo.start);
  };

  const eventStyleGetter = (event: { resource: Post }) => {
    const post = event.resource;
    const backgroundColor = getStatusColor(post?.status || 'scheduled');
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: '500',
        fontSize: '0.875rem',
      }
    };
  };

  return (
    <div suppressHydrationWarning>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
                <p className="text-sm text-muted-foreground">
                  View and manage your scheduled social media posts
                </p>
              </div>

              <div className="px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Schedule Overview</CardTitle>
                <CardDescription>
                  Click on a date to view scheduled posts
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {loadingPosts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="calendar-wrapper relative" style={{ height: '600px' }}>
                    <BigCalendar
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: '100%' }}
                      date={currentDate}
                      view={currentView}
                      onNavigate={handleNavigate}
                      onView={handleViewChange}
                      onSelectEvent={handleSelectEvent}
                      onSelectSlot={handleSelectSlot}
                      selectable
                      eventPropGetter={eventStyleGetter}
                      views={['month', 'week', 'day', 'agenda']}
                      popup
                      step={30}
                      showMultiDayTimes
                      components={{
                        agenda: {
                          event: ({ event }: { event: { title: string } }) => (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.title}</span>
                            </div>
                          ),
                        },
                      }}
                      messages={{
                        today: 'Today',
                        previous: 'Back',
                        next: 'Next',
                        month: 'Month',
                        week: 'Week',
                        day: 'Day',
                        agenda: 'Agenda',
                        date: 'Date',
                        time: 'Time',
                        event: 'Event',
                        noEventsInRange: '',
                        showMore: (total) => `+${total} more`
                      }}
                    />
                    {currentView === 'agenda' && calendarEvents.length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <CalendarIcon className="h-12 w-12 mb-2 opacity-50 text-muted-foreground" />
                        <p className="text-muted-foreground">No scheduled posts</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduled Posts for Selected Date */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      {selectedDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  ) : (
                    'Select a date'
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedDatePosts.length === 0
                    ? 'No posts scheduled'
                    : `${selectedDatePosts.length} post${selectedDatePosts.length !== 1 ? 's' : ''} scheduled`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDatePosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No posts scheduled for this date</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      asChild
                    >
                      <a href="/dashboard/social-media">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule a post
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDatePosts.map((post) => (
                      <div
                        key={post.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setShowDetailsDialog(true)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">
                              {formatTime(post.scheduledDate)}
                            </span>
                          </div>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm line-clamp-2 mb-2">
                          {post.caption}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {post.social_accounts.length} account{post.social_accounts.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Posts */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Posts</CardTitle>
                  <CardDescription>
                    All scheduled posts in chronological order
                  </CardDescription>
                </div>
                <Button size="sm" asChild>
                  <a href="/dashboard/social-media">
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No scheduled posts</p>
                  <p className="text-sm">Schedule your first post to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts
                    .filter(post => post.scheduled_at)
                    .sort((a, b) =>
                      new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
                    )
                    .slice(0, 10)
                    .map((post) => (
                      <div
                        key={post.id}
                        className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {new Date(post.scheduled_at!).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            <span className="text-sm">
                              {formatTime(new Date(post.scheduled_at!))}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2 mb-2">{post.caption}</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(post.status)}
                            {getStatusBadge(post.status)}
                            <Badge variant="outline" className="text-xs">
                              {post.social_accounts.length} account{post.social_accounts.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
