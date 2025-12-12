"use client";

import { useState, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DataTableWrapper, { ColumnDef } from "@/components/ui/data-table-wrapper";
import {
  Loader2,
  Hash,
  Video,
  User,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface TikTokVideo {
  [key: string]: unknown;
  id: string;
  text?: string;
  createTime?: number;
  createTimeISO?: string;
  authorMeta?: {
    id?: string;
    name?: string;
    nickName?: string;
    verified?: boolean;
    signature?: string;
    avatar?: string;
    following?: number;
    fans?: number;
    heart?: number;
    video?: number;
  };
  musicMeta?: {
    musicName?: string;
    musicAuthor?: string;
    musicOriginal?: boolean;
  };
  webVideoUrl?: string;
  videoMeta?: {
    width?: number;
    height?: number;
    duration?: number;
  };
  diggCount?: number;
  shareCount?: number;
  playCount?: number;
  commentCount?: number;
  hashtags?: Array<{ id: string; name: string }>;
}

export default function TikTokScraperPage() {
  const [activeTab, setActiveTab] = useState("hashtags");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TikTokVideo[]>([]);
  const [error, setError] = useState("");

  // Form inputs
  const [hashtags, setHashtags] = useState("");
  const [profileUrls, setProfileUrls] = useState("");
  const [videoUrls, setVideoUrls] = useState("");
  const [resultsLimit, setResultsLimit] = useState("50");

  // Filters
  const [minLikes, setMinLikes] = useState("");
  const [minViews, setMinViews] = useState("");
  const [minComments, setMinComments] = useState("");
  const [minShares, setMinShares] = useState("");

  const handleScrape = async () => {
    setError("");
    setLoading(true);

    try {
      let input: unknown;
      let scraperType: string;

      if (activeTab === "hashtags") {
        const hashtagList = hashtags
          .split(",")
          .map(h => h.trim())
          .filter(h => h);

        if (hashtagList.length === 0) {
          setError("Please enter at least one hashtag");
          setLoading(false);
          return;
        }

        scraperType = "general";
        input = { hashtags: hashtagList };
      } else if (activeTab === "profiles") {
        const profileList = profileUrls
          .split("\n")
          .map(p => p.trim())
          .filter(p => p);

        if (profileList.length === 0) {
          setError("Please enter at least one profile URL");
          setLoading(false);
          return;
        }

        scraperType = "profile";
        input = profileList;
      } else {
        const videoList = videoUrls
          .split("\n")
          .map(v => v.trim())
          .filter(v => v);

        if (videoList.length === 0) {
          setError("Please enter at least one video URL");
          setLoading(false);
          return;
        }

        scraperType = "video";
        input = videoList;
      }

      const response = await fetch('/api/tiktok/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scraperType,
          input,
          resultsLimit: parseInt(resultsLimit) || 50,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setResults(result.data || []);
        setHashtags("");
        setProfileUrls("");
        setVideoUrls("");
      } else {
        setError(result.error || 'Failed to scrape TikTok');
      }
    } catch (error) {
      setError('An error occurred during scraping');
      console.error('Scrape error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to results
  const filteredResults = useMemo(() => {
    return results.filter(video => {
      if (minLikes && (video.diggCount || 0) < parseInt(minLikes)) return false;
      if (minViews && (video.playCount || 0) < parseInt(minViews)) return false;
      if (minComments && (video.commentCount || 0) < parseInt(minComments)) return false;
      if (minShares && (video.shareCount || 0) < parseInt(minShares)) return false;
      return true;
    });
  }, [results, minLikes, minViews, minComments, minShares]);

  // Define columns for DataTable
  const columns: ColumnDef<TikTokVideo>[] = [
    {
      key: 'authorMeta.name',
      header: 'Creator',
      accessor: (row) => row.authorMeta?.name || 'Unknown',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.authorMeta?.avatar && (
            <img
              src={row.authorMeta.avatar}
              alt={row.authorMeta.name || 'Avatar'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <div className="font-medium flex items-center gap-1">
              {row.authorMeta?.name || 'Unknown'}
              {row.authorMeta?.verified && (
                <Badge variant="secondary" className="text-xs">✓</Badge>
              )}
            </div>
            <div className="text-xs text-gray-500">
              @{row.authorMeta?.nickName || row.authorMeta?.name}
            </div>
          </div>
        </div>
      ),
      width: '200px',
    },
    {
      key: 'text',
      header: 'Caption',
      accessor: (row) => row.text || '',
      render: (value, row) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{String(value) || 'No caption'}</p>
          {row.hashtags && row.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {row.hashtags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  #{tag.name}
                </Badge>
              ))}
              {row.hashtags.length > 3 && (
                <span className="text-xs text-gray-500">+{row.hashtags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      ),
      width: '300px',
    },
    {
      key: 'playCount',
      header: 'Views',
      type: 'number',
      accessor: (row) => row.playCount || 0,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3 text-gray-400" />
          <span>{Number(value || 0).toLocaleString()}</span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'diggCount',
      header: 'Likes',
      type: 'number',
      accessor: (row) => row.diggCount || 0,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-red-400" />
          <span>{Number(value || 0).toLocaleString()}</span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'commentCount',
      header: 'Comments',
      type: 'number',
      accessor: (row) => row.commentCount || 0,
      render: (value) => (
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3 text-blue-400" />
          <span>{Number(value || 0).toLocaleString()}</span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'shareCount',
      header: 'Shares',
      type: 'number',
      accessor: (row) => row.shareCount || 0,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Share2 className="w-3 h-3 text-green-400" />
          <span>{Number(value || 0).toLocaleString()}</span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'engagement',
      header: 'Engagement Rate',
      accessor: (row) => {
        const plays = row.playCount || 0;
        const engagements = (row.diggCount || 0) + (row.commentCount || 0) + (row.shareCount || 0);
        return plays > 0 ? ((engagements / plays) * 100).toFixed(2) : 0;
      },
      render: (value) => <span>{String(value)}%</span>,
      width: '140px',
    },
    {
      key: 'createTime',
      header: 'Posted',
      accessor: (row) => row.createTimeISO || new Date((row.createTime || 0) * 1000).toISOString(),
      render: (value) => {
        const date = new Date(String(value));
        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString()}
          </span>
        );
      },
      width: '120px',
    },
    {
      key: 'actions',
      header: 'Actions',
      type: 'actions',
      actions: [
        {
          label: 'View on TikTok',
          onClick: (row) => {
            if (row.webVideoUrl) {
              window.open(row.webVideoUrl, '_blank');
            }
          },
          variant: 'default',
          icon: ExternalLink,
        },
      ],
      width: '100px',
    },
  ];

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
                <h1 className="text-2xl font-bold tracking-tight">TikTok Content Scraper</h1>
                <p className="text-sm text-muted-foreground">
                  Discover trends, analyze creators, and find UGC inspiration
                </p>
              </div>

              <div className="px-4 lg:px-6 space-y-6">
          {/* Scraper Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scrape TikTok Content</CardTitle>
              <CardDescription>
                Choose your scraping method and enter your search criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="hashtags">
                    <Hash className="h-4 w-4 mr-2" />
                    Hashtags & Trends
                  </TabsTrigger>
                  <TabsTrigger value="profiles">
                    <User className="h-4 w-4 mr-2" />
                    Creator Profiles
                  </TabsTrigger>
                  <TabsTrigger value="videos">
                    <Video className="h-4 w-4 mr-2" />
                    Specific Videos
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  {/* Hashtags Tab */}
                  <TabsContent value="hashtags" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                      <Input
                        id="hashtags"
                        placeholder="ugc, contentcreator, tiktokmademebuyit"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter hashtags without the # symbol, separated by commas
                      </p>
                    </div>
                  </TabsContent>

                  {/* Profiles Tab */}
                  <TabsContent value="profiles" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profiles">Profile URLs (one per line)</Label>
                      <Textarea
                        id="profiles"
                        placeholder="https://www.tiktok.com/@username1&#10;https://www.tiktok.com/@username2"
                        value={profileUrls}
                        onChange={(e) => setProfileUrls(e.target.value)}
                        rows={5}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter full TikTok profile URLs, one per line
                      </p>
                    </div>
                  </TabsContent>

                  {/* Videos Tab */}
                  <TabsContent value="videos" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="videos">Video URLs (one per line)</Label>
                      <Textarea
                        id="videos"
                        placeholder="https://www.tiktok.com/@username/video/1234567890&#10;https://www.tiktok.com/@username/video/0987654321"
                        value={videoUrls}
                        onChange={(e) => setVideoUrls(e.target.value)}
                        rows={5}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter full TikTok video URLs, one per line
                      </p>
                    </div>
                  </TabsContent>

                  {/* Results Limit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="limit">Results Limit</Label>
                      <Input
                        id="limit"
                        type="number"
                        min="1"
                        max="200"
                        value={resultsLimit}
                        onChange={(e) => setResultsLimit(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button
                    onClick={handleScrape}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scraping TikTok...
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Start Scraping
                      </>
                    )}
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Filters Card */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Filter Results</CardTitle>
                <CardDescription>
                  Set minimum criteria for videos to display
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="minLikes">Min Likes</Label>
                    <Input
                      id="minLikes"
                      type="number"
                      placeholder="0"
                      value={minLikes}
                      onChange={(e) => setMinLikes(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minViews">Min Views</Label>
                    <Input
                      id="minViews"
                      type="number"
                      placeholder="0"
                      value={minViews}
                      onChange={(e) => setMinViews(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minComments">Min Comments</Label>
                    <Input
                      id="minComments"
                      type="number"
                      placeholder="0"
                      value={minComments}
                      onChange={(e) => setMinComments(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minShares">Min Shares</Label>
                    <Input
                      id="minShares"
                      type="number"
                      placeholder="0"
                      value={minShares}
                      onChange={(e) => setMinShares(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">{filteredResults.length} videos match criteria</Badge>
                  {filteredResults.length < results.length && (
                    <span className="text-sm text-muted-foreground">
                      ({results.length - filteredResults.length} filtered out)
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <DataTableWrapper
              data={filteredResults}
              columns={columns}
              title="Scraped TikTok Videos"
              searchable={true}
              searchKeys={['authorMeta.name', 'text']}
              searchPlaceholder="Search by creator or caption..."
              filterable={false}
              addable={false}
              hoverable={true}
              paginated={true}
              defaultPageSize={25}
              emptyMessage="No videos match your filter criteria"
              onRowClick={(row) => {
                if (row.webVideoUrl) {
                  window.open(row.webVideoUrl, '_blank');
                }
              }}
            />
          )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
