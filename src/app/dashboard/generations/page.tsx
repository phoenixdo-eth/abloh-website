"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Search,
  Filter,
  Grid3x3,
  List,
  Download,
  MoreVertical,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Calendar,
  Loader2,
  Play,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Generation {
  id: string;
  model?: string;
  type: string;
  promptText?: string;
  prompt?: string;
  imageUrl?: string;
  output: {
    url?: string;
    data?: { url?: string }[];
    [key: string]: unknown;
  };
  createdAt: string;
  source?: string;
}

export default function GenerationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      const [runwayRes, kieRes] = await Promise.all([
        fetch('/api/runway/generate'),
        fetch('/api/kie/generate'),
      ]);

      const runwayData = await runwayRes.json();
      const kieData = await kieRes.json();

      const allGenerations: Generation[] = [];

      if (runwayData.success && runwayData.generations) {
        const runwayGens = runwayData.generations.map((gen: Generation) => ({
          ...gen,
          source: 'runway',
        }));
        allGenerations.push(...runwayGens);
      }

      if (kieData.success && kieData.generations) {
        const kieGens = kieData.generations.map((gen: Generation) => ({
          ...gen,
          source: 'kie',
        }));
        allGenerations.push(...kieGens);
      }

      // Sort by creation date (newest first)
      allGenerations.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setGenerations(allGenerations);
    } catch (error) {
      console.error('Error fetching generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // In a real implementation, this would call an API to delete the generation
    setGenerations(generations.filter((gen) => gen.id !== id));
  };

  const getGenerationUrl = (generation: Generation): string | null => {
    if (generation.output?.url) return generation.output.url;
    if (generation.output?.data && generation.output.data.length > 0) {
      return generation.output.data[0]?.url || null;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <VideoIcon className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const filteredGenerations = generations.filter((gen) => {
    const prompt = gen.promptText || gen.prompt || '';
    const matchesSearch = prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gen.model?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || gen.type === filterType;
    const matchesSource = filterSource === "all" || gen.source === filterSource;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "images" && gen.type === "image") ||
      (activeTab === "videos" && gen.type === "video") ||
      (activeTab === "audio" && gen.type === "audio");

    return matchesSearch && matchesType && matchesSource && matchesTab;
  });

  const getStats = () => {
    return {
      total: generations.length,
      images: generations.filter((g) => g.type === "image").length,
      videos: generations.filter((g) => g.type === "video").length,
      audio: generations.filter((g) => g.type === "audio").length,
      runway: generations.filter((g) => g.source === "runway").length,
      kie: generations.filter((g) => g.source === "kie").length,
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
                      <h1 className="text-2xl font-bold tracking-tight">Generations</h1>
                      <p className="text-sm text-muted-foreground">
                        View and manage all your AI-generated content
                      </p>
                    </div>
                    <Button onClick={fetchGenerations} disabled={loading}>
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Refresh
                    </Button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Images</CardTitle>
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.images}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Videos</CardTitle>
                        <VideoIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.videos}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Audio</CardTitle>
                        <Music className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.audio}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="images">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Images
                      </TabsTrigger>
                      <TabsTrigger value="videos">
                        <VideoIcon className="h-4 w-4 mr-2" />
                        Videos
                      </TabsTrigger>
                      <TabsTrigger value="audio">
                        <Music className="h-4 w-4 mr-2" />
                        Audio
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by prompt or model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={filterSource} onValueChange={setFilterSource}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="runway">Runway</SelectItem>
                        <SelectItem value="kie">Kie</SelectItem>
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
                  {loading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredGenerations.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Sparkles className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No generations yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                          Start creating content with AI to see your generations here
                        </p>
                      </CardContent>
                    </Card>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredGenerations.map((generation) => {
                        const url = getGenerationUrl(generation);
                        const prompt = generation.promptText || generation.prompt || 'No prompt';

                        return (
                          <Card key={generation.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                            <div className="relative aspect-square bg-muted">
                              {generation.type === 'image' && url ? (
                                <img
                                  src={url}
                                  alt={prompt}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => setSelectedGeneration(generation)}
                                />
                              ) : generation.type === 'video' && url ? (
                                <div
                                  className="w-full h-full relative cursor-pointer"
                                  onClick={() => setSelectedGeneration(generation)}
                                >
                                  <video
                                    src={url}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                    <Play className="h-12 w-12 text-white" fill="white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {getTypeIcon(generation.type)}
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex gap-2">
                                <Badge variant="secondary" className="backdrop-blur-sm bg-black/50 text-white border-0">
                                  {generation.type}
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
                                  <DropdownMenuItem onClick={() => setSelectedGeneration(generation)}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {url && (
                                    <>
                                      <DropdownMenuItem asChild>
                                        <a href={url} download target="_blank" rel="noopener noreferrer">
                                          <Download className="mr-2 h-4 w-4" />
                                          Download
                                        </a>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(url)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy URL
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(generation.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <CardContent className="p-4">
                              <p className="text-sm mb-2 line-clamp-2">{prompt}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(generation.createdAt)}
                                </div>
                                {generation.model && (
                                  <Badge variant="outline" className="text-xs">
                                    {generation.model}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredGenerations.map((generation) => {
                        const url = getGenerationUrl(generation);
                        const prompt = generation.promptText || generation.prompt || 'No prompt';

                        return (
                          <Card key={generation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="flex gap-4 p-4">
                              <div className="relative w-32 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                                {generation.type === 'image' && url ? (
                                  <img
                                    src={url}
                                    alt={prompt}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => setSelectedGeneration(generation)}
                                  />
                                ) : generation.type === 'video' && url ? (
                                  <div
                                    className="w-full h-full relative cursor-pointer"
                                    onClick={() => setSelectedGeneration(generation)}
                                  >
                                    <video
                                      src={url}
                                      className="w-full h-full object-cover"
                                      muted
                                      loop
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <Play className="h-8 w-8 text-white" fill="white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    {getTypeIcon(generation.type)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm mb-2">{prompt}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant="outline" className="capitalize">
                                        {getTypeIcon(generation.type)}
                                        <span className="ml-1">{generation.type}</span>
                                      </Badge>
                                      {generation.model && (
                                        <Badge variant="secondary">
                                          {generation.model}
                                        </Badge>
                                      )}
                                      {generation.source && (
                                        <Badge variant="outline" className="capitalize">
                                          {generation.source}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setSelectedGeneration(generation)}>
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      {url && (
                                        <>
                                          <DropdownMenuItem asChild>
                                            <a href={url} download target="_blank" rel="noopener noreferrer">
                                              <Download className="mr-2 h-4 w-4" />
                                              Download
                                            </a>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(url)}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy URL
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => handleDelete(generation.id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(generation.createdAt)}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Dialog */}
          <Dialog open={!!selectedGeneration} onOpenChange={() => setSelectedGeneration(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generation Details</DialogTitle>
                <DialogDescription>
                  View full details and download your generation
                </DialogDescription>
              </DialogHeader>
              {selectedGeneration && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    {selectedGeneration.type === 'image' && getGenerationUrl(selectedGeneration) ? (
                      <img
                        src={getGenerationUrl(selectedGeneration)!}
                        alt={selectedGeneration.promptText || selectedGeneration.prompt || 'Generated image'}
                        className="w-full h-full object-contain"
                      />
                    ) : selectedGeneration.type === 'video' && getGenerationUrl(selectedGeneration) ? (
                      <video
                        src={getGenerationUrl(selectedGeneration)!}
                        controls
                        className="w-full h-full"
                      />
                    ) : selectedGeneration.type === 'audio' && getGenerationUrl(selectedGeneration) ? (
                      <div className="flex items-center justify-center h-full">
                        <audio src={getGenerationUrl(selectedGeneration)!} controls className="w-full max-w-md" />
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Prompt</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedGeneration.promptText || selectedGeneration.prompt || 'No prompt available'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Type</h4>
                        <Badge variant="outline" className="capitalize">
                          {getTypeIcon(selectedGeneration.type)}
                          <span className="ml-1">{selectedGeneration.type}</span>
                        </Badge>
                      </div>
                      {selectedGeneration.model && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Model</h4>
                          <Badge variant="secondary">{selectedGeneration.model}</Badge>
                        </div>
                      )}
                      {selectedGeneration.source && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Source</h4>
                          <Badge variant="outline" className="capitalize">
                            {selectedGeneration.source}
                          </Badge>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium mb-1">Created</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedGeneration.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {getGenerationUrl(selectedGeneration) && (
                      <div className="flex gap-2 pt-4">
                        <Button asChild className="flex-1">
                          <a
                            href={getGenerationUrl(selectedGeneration)!}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            navigator.clipboard.writeText(getGenerationUrl(selectedGeneration)!);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
