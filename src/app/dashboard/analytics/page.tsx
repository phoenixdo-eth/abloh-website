"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Video,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface VideoPerformance {
  id: string;
  title: string;
  platform: "instagram" | "tiktok";
  publishedAt: string;
  thumbnailUrl?: string;
  url: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  engagementRate: number;
  viewsTrend: number; // percentage change
}

const mockVideos: VideoPerformance[] = [
  {
    id: "1",
    title: "Summer Fashion Haul 2024",
    platform: "instagram",
    publishedAt: "2024-03-15T10:00:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop",
    url: "https://www.instagram.com/reel/abc123",
    views: 125400,
    likes: 8920,
    comments: 234,
    shares: 456,
    saves: 1200,
    engagementRate: 8.5,
    viewsTrend: 15.2,
  },
  {
    id: "2",
    title: "UGC Tutorial: Product Photography",
    platform: "tiktok",
    publishedAt: "2024-03-14T14:30:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop",
    url: "https://www.tiktok.com/@user/video/123456",
    views: 456000,
    likes: 45600,
    comments: 892,
    shares: 3400,
    engagementRate: 10.8,
    viewsTrend: 23.5,
  },
  {
    id: "3",
    title: "Day in My Life as Content Creator",
    platform: "instagram",
    publishedAt: "2024-03-13T09:00:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop",
    url: "https://www.instagram.com/reel/def456",
    views: 89200,
    likes: 5600,
    comments: 178,
    shares: 234,
    saves: 890,
    engagementRate: 7.8,
    viewsTrend: -5.3,
  },
  {
    id: "4",
    title: "Viral Editing Tricks You Need",
    platform: "tiktok",
    publishedAt: "2024-03-12T16:00:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&h=200&fit=crop",
    url: "https://www.tiktok.com/@user/video/789012",
    views: 892000,
    likes: 67800,
    comments: 1234,
    shares: 5600,
    engagementRate: 12.4,
    viewsTrend: 45.8,
  },
  {
    id: "5",
    title: "Budget-Friendly Home Decor Ideas",
    platform: "instagram",
    publishedAt: "2024-03-11T11:30:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=200&h=200&fit=crop",
    url: "https://www.instagram.com/reel/ghi789",
    views: 67800,
    likes: 4200,
    comments: 123,
    shares: 178,
    saves: 890,
    engagementRate: 7.9,
    viewsTrend: -2.1,
  },
  {
    id: "6",
    title: "Brand Deal Behind the Scenes",
    platform: "tiktok",
    publishedAt: "2024-03-10T13:00:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop",
    url: "https://www.tiktok.com/@user/video/345678",
    views: 234000,
    likes: 18900,
    comments: 456,
    shares: 2100,
    engagementRate: 9.2,
    viewsTrend: 12.7,
  },
];

export default function AnalyticsPage() {
  const [videos, setVideos] = useState<VideoPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('timeRange', timeRange);
        if (platformFilter !== 'all') {
          params.append('platform', platformFilter);
        }

        const response = await fetch(`/api/analytics/videos?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.videos) {
          setVideos(data.videos);
        } else {
          // Fallback to mock data if API fails or returns no data
          console.warn('API returned no videos, using mock data');
          setVideos(mockVideos);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Fallback to mock data on error
        setVideos(mockVideos);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, platformFilter]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredVideos = videos.filter((video) => {
    if (platformFilter === "all") return true;
    return video.platform === platformFilter;
  });

  const calculateStats = () => {
    const totalViews = filteredVideos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = filteredVideos.reduce((sum, v) => sum + v.likes, 0);
    const totalComments = filteredVideos.reduce((sum, v) => sum + v.comments, 0);
    const totalShares = filteredVideos.reduce((sum, v) => sum + v.shares, 0);
    const avgEngagement = filteredVideos.length > 0
      ? filteredVideos.reduce((sum, v) => sum + v.engagementRate, 0) / filteredVideos.length
      : 0;

    // Calculate average views trend
    const avgViewsTrend = filteredVideos.length > 0
      ? filteredVideos.reduce((sum, v) => sum + v.viewsTrend, 0) / filteredVideos.length
      : 0;

    return {
      totalVideos: filteredVideos.length,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagement,
      avgViewsTrend,
      totalEngagements: totalLikes + totalComments + totalShares,
    };
  };

  const stats = calculateStats();

  const topPerformers = [...filteredVideos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Content Analytics</h1>
                      <p className="text-sm text-muted-foreground">
                        Track performance of your videos across platforms
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Select value={platformFilter} onValueChange={setPlatformFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                          <Video className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.totalVideos}</div>
                          <p className="text-xs text-muted-foreground">
                            Published this period
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
                          <div className="flex items-center text-xs">
                            {stats.avgViewsTrend >= 0 ? (
                              <>
                                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                <span className="text-green-500">+{stats.avgViewsTrend.toFixed(1)}%</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                <span className="text-red-500">{stats.avgViewsTrend.toFixed(1)}%</span>
                              </>
                            )}
                            <span className="text-muted-foreground ml-1">vs last period</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.avgEngagement.toFixed(1)}%</div>
                          <p className="text-xs text-muted-foreground">
                            Average across all videos
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
                          <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatNumber(stats.totalEngagements)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Likes, comments & shares
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Engagement Breakdown */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Likes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2">
                            {formatNumber(stats.totalLikes)}
                          </div>
                          <Progress
                            value={(stats.totalLikes / stats.totalEngagements) * 100}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            {((stats.totalLikes / stats.totalEngagements) * 100).toFixed(1)}% of total engagement
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Comments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2">
                            {formatNumber(stats.totalComments)}
                          </div>
                          <Progress
                            value={(stats.totalComments / stats.totalEngagements) * 100}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            {((stats.totalComments / stats.totalEngagements) * 100).toFixed(1)}% of total engagement
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Shares</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2">
                            {formatNumber(stats.totalShares)}
                          </div>
                          <Progress
                            value={(stats.totalShares / stats.totalEngagements) * 100}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            {((stats.totalShares / stats.totalEngagements) * 100).toFixed(1)}% of total engagement
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Top Performers */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Top Performing Videos
                        </CardTitle>
                        <CardDescription>
                          Your best content by view count
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {topPerformers.map((video, index) => (
                            <div key={video.id} className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {index + 1}
                              </div>
                              {video.thumbnailUrl && (
                                <img
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{video.title}</h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <Badge variant="outline" className="capitalize">
                                    {video.platform}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {formatNumber(video.views)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {formatNumber(video.likes)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-500">
                                  {video.engagementRate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-muted-foreground">engagement</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* All Videos Performance Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          All Videos Performance
                        </CardTitle>
                        <CardDescription>
                          Detailed metrics for all your content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Video</TableHead>
                                  <TableHead>Platform</TableHead>
                                  <TableHead>Published</TableHead>
                                  <TableHead className="text-right">Views</TableHead>
                                  <TableHead className="text-right">Likes</TableHead>
                                  <TableHead className="text-right">Comments</TableHead>
                                  <TableHead className="text-right">Shares</TableHead>
                                  <TableHead className="text-right">Engagement</TableHead>
                                  <TableHead className="text-right">Trend</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredVideos.map((video) => (
                                  <TableRow key={video.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        {video.thumbnailUrl && (
                                          <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-12 h-12 rounded object-cover"
                                          />
                                        )}
                                        <div className="max-w-[200px]">
                                          <div className="font-medium truncate">{video.title}</div>
                                          <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                          >
                                            View post
                                            <ArrowUpRight className="h-3 w-3" />
                                          </a>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="capitalize">
                                        {video.platform}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(video.publishedAt)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {formatNumber(video.views)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <Heart className="h-3 w-3 text-red-400" />
                                        {formatNumber(video.likes)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <MessageCircle className="h-3 w-3 text-blue-400" />
                                        {formatNumber(video.comments)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <Share2 className="h-3 w-3 text-green-400" />
                                        {formatNumber(video.shares)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Badge
                                        variant={video.engagementRate >= 10 ? "default" : "secondary"}
                                      >
                                        {video.engagementRate.toFixed(1)}%
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {video.viewsTrend >= 0 ? (
                                        <div className="flex items-center justify-end gap-1 text-green-500">
                                          <TrendingUp className="h-3 w-3" />
                                          <span className="text-sm">+{video.viewsTrend.toFixed(1)}%</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-end gap-1 text-red-500">
                                          <TrendingDown className="h-3 w-3" />
                                          <span className="text-sm">{video.viewsTrend.toFixed(1)}%</span>
                                        </div>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
