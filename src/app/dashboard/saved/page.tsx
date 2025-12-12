"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bookmark,
  Search,
  Filter,
  Grid3x3,
  List,
  MoreVertical,
  Trash2,
  ExternalLink,
  Instagram,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Tag,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SavedItem {
  id: string;
  type: "instagram" | "tiktok" | "profile";
  title: string;
  description?: string;
  thumbnailUrl?: string;
  sourceUrl: string;
  sourcePlatform: "instagram" | "tiktok";
  savedAt: string;
  tags: string[];
  author?: {
    name: string;
    username: string;
    avatar?: string;
  };
  stats?: {
    likes?: number;
    comments?: number;
    views?: number;
  };
}

const mockSavedItems: SavedItem[] = [
  {
    id: "1",
    type: "instagram",
    title: "Summer Fashion Collection 2024",
    description: "Amazing summer vibes with the latest trends #fashion #summer",
    thumbnailUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop",
    sourceUrl: "https://www.instagram.com/p/abc123",
    sourcePlatform: "instagram",
    savedAt: "2024-03-15T10:30:00Z",
    tags: ["fashion", "summer", "trends"],
    author: {
      name: "Fashion Insider",
      username: "fashioninsider",
      avatar: "",
    },
    stats: {
      likes: 15420,
      comments: 234,
      views: 45000,
    },
  },
  {
    id: "2",
    type: "tiktok",
    title: "UGC Content Creation Tips",
    description: "5 tips for creating engaging UGC content that converts",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop",
    sourceUrl: "https://www.tiktok.com/@creator/video/123456",
    sourcePlatform: "tiktok",
    savedAt: "2024-03-14T15:20:00Z",
    tags: ["ugc", "content", "marketing"],
    author: {
      name: "Content Creator Pro",
      username: "contentcreatorpro",
      avatar: "",
    },
    stats: {
      likes: 8920,
      comments: 156,
      views: 125000,
    },
  },
  {
    id: "3",
    type: "instagram",
    title: "Product Photography Tutorial",
    description: "Learn how to take stunning product photos with just your phone",
    thumbnailUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
    sourceUrl: "https://www.instagram.com/p/def456",
    sourcePlatform: "instagram",
    savedAt: "2024-03-13T09:45:00Z",
    tags: ["photography", "tutorial", "ecommerce"],
    author: {
      name: "Photo Guru",
      username: "photoguru",
      avatar: "",
    },
    stats: {
      likes: 22100,
      comments: 445,
      views: 89000,
    },
  },
  {
    id: "4",
    type: "tiktok",
    title: "Viral Video Editing Tricks",
    description: "The editing secrets that made my videos go viral",
    thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=400&fit=crop",
    sourceUrl: "https://www.tiktok.com/@editor/video/789012",
    sourcePlatform: "tiktok",
    savedAt: "2024-03-12T14:10:00Z",
    tags: ["editing", "viral", "video"],
    author: {
      name: "Video Editor",
      username: "videoeditor",
      avatar: "",
    },
    stats: {
      likes: 45600,
      comments: 892,
      views: 320000,
    },
  },
  {
    id: "5",
    type: "profile",
    title: "@influencermarketing",
    description: "Top influencer marketing agency with proven results",
    thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop",
    sourceUrl: "https://www.instagram.com/influencermarketing",
    sourcePlatform: "instagram",
    savedAt: "2024-03-11T11:20:00Z",
    tags: ["influencer", "marketing", "agency"],
    author: {
      name: "Influencer Marketing Co",
      username: "influencermarketing",
      avatar: "",
    },
    stats: {
      likes: 0,
      comments: 0,
      views: 0,
    },
  },
  {
    id: "6",
    type: "instagram",
    title: "Brand Collaboration Ideas",
    description: "Creative ways to collaborate with brands as a content creator",
    thumbnailUrl: "https://images.unsplash.com/photo-1557425529-8c4a599ec56c?w=400&h=400&fit=crop",
    sourceUrl: "https://www.instagram.com/p/ghi789",
    sourcePlatform: "instagram",
    savedAt: "2024-03-10T16:30:00Z",
    tags: ["collaboration", "brands", "creator"],
    author: {
      name: "Brand Partnerships",
      username: "brandpartnerships",
      avatar: "",
    },
    stats: {
      likes: 12800,
      comments: 267,
      views: 54000,
    },
  },
];

export default function SavedContentPage() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(mockSavedItems);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const handleDeleteItem = (id: string) => {
    setSavedItems(savedItems.filter((item) => item.id !== id));
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filteredItems = savedItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = filterPlatform === "all" || item.sourcePlatform === filterPlatform;
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "instagram" && item.sourcePlatform === "instagram") ||
      (activeTab === "tiktok" && item.sourcePlatform === "tiktok");

    return matchesSearch && matchesPlatform && matchesType && matchesTab;
  });

  const getStats = () => {
    return {
      total: savedItems.length,
      instagram: savedItems.filter((item) => item.sourcePlatform === "instagram").length,
      tiktok: savedItems.filter((item) => item.sourcePlatform === "tiktok").length,
      posts: savedItems.filter((item) => item.type !== "profile").length,
      profiles: savedItems.filter((item) => item.type === "profile").length,
    };
  };

  const stats = getStats();

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
                      <h1 className="text-2xl font-bold tracking-tight">Saved</h1>
                      <p className="text-sm text-muted-foreground">
                        Your collection of bookmarked inspiration and references
                      </p>
                    </div>
                    <Button variant="outline">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Collections
                    </Button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Instagram</CardTitle>
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.instagram}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">TikTok</CardTitle>
                        <svg
                          className="h-4 w-4 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.tiktok}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Posts</CardTitle>
                        <Grid3x3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.posts}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profiles</CardTitle>
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs">P</AvatarFallback>
                        </Avatar>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.profiles}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="instagram">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </TabsTrigger>
                      <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search saved..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Content Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="instagram">Posts</SelectItem>
                        <SelectItem value="tiktok">Videos</SelectItem>
                        <SelectItem value="profile">Profiles</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Grid/List */}
                  {filteredItems.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Bookmark className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No saved items</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                          Start saving inspiring content from Instagram and TikTok to build your
                          collection
                        </p>
                      </CardContent>
                    </Card>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative aspect-square bg-muted">
                            {item.thumbnailUrl && (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                              <Badge variant="secondary" className="backdrop-blur-sm bg-black/50 text-white border-0">
                                {item.sourcePlatform}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute top-2 left-2 backdrop-blur-sm bg-black/50 hover:bg-black/70 text-white border-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Original
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Tag className="mr-2 h-4 w-4" />
                                  Edit Tags
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            {item.author && (
                              <div className="flex items-center gap-2 mb-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={item.author.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {item.author.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  @{item.author.username}
                                </span>
                              </div>
                            )}
                            {item.type !== "profile" && item.stats && (
                              <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                                {item.stats.likes !== undefined && item.stats.likes > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3.5 w-3.5" />
                                    {formatNumber(item.stats.likes)}
                                  </div>
                                )}
                                {item.stats.comments !== undefined && item.stats.comments > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    {formatNumber(item.stats.comments)}
                                  </div>
                                )}
                                {item.stats.views !== undefined && item.stats.views > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    {formatNumber(item.stats.views)}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1 flex-wrap">
                                {item.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.savedAt)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="flex gap-4 p-4">
                            <div className="relative w-32 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                              {item.thumbnailUrl && (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold mb-1">{item.title}</h3>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open Original
                                      </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Tag className="mr-2 h-4 w-4" />
                                      Edit Tags
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {item.author && (
                                <div className="flex items-center gap-2 mb-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={item.author.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {item.author.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground">
                                    @{item.author.username}
                                  </span>
                                  <Badge variant="secondary" className="ml-2">
                                    {item.sourcePlatform}
                                  </Badge>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {item.type !== "profile" && item.stats && (
                                    <>
                                      {item.stats.likes !== undefined && item.stats.likes > 0 && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Heart className="h-3.5 w-3.5" />
                                          {formatNumber(item.stats.likes)}
                                        </div>
                                      )}
                                      {item.stats.comments !== undefined && item.stats.comments > 0 && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <MessageCircle className="h-3.5 w-3.5" />
                                          {formatNumber(item.stats.comments)}
                                        </div>
                                      )}
                                      {item.stats.views !== undefined && item.stats.views > 0 && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Eye className="h-3.5 w-3.5" />
                                          {formatNumber(item.stats.views)}
                                        </div>
                                      )}
                                    </>
                                  )}
                                  <div className="flex gap-1">
                                    {item.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {item.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{item.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(item.savedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
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
