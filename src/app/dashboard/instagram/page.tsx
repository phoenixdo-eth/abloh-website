"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Instagram,
  Loader2,
  ExternalLink,
  Calendar,
  User,
  Image,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InstagramProfile {
  id: string;
  profileUrl: string;
  scrapedAt: string;
  data: {
    username?: string;
    fullName?: string;
    biography?: string;
    followersCount?: number;
    followsCount?: number;
    postsCount?: number;
    profilePicUrl?: string;
    isVerified?: boolean;
    isPrivate?: boolean;
    url?: string;
  };
}

export default function InstagramScraperPage() {
  const [profileUrl, setProfileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profiles, setProfiles] = useState<InstagramProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<InstagramProfile | null>(null);
  const [error, setError] = useState("");

  // Fetch existing profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const response = await fetch('/api/instagram/scrape');
      const result = await response.json();

      if (result.success) {
        setProfiles(result.profiles);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleScrape = async () => {
    if (!profileUrl) {
      setError("Please enter an Instagram profile URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/instagram/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProfileUrl("");
        fetchProfiles(); // Refresh the list
      } else {
        setError(result.error || 'Failed to scrape profile');
      }
    } catch (error) {
      setError('An error occurred while scraping the profile');
      console.error('Scrape error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                <h1 className="text-2xl font-bold tracking-tight">Instagram Profile Scraper</h1>
                <p className="text-sm text-muted-foreground">
                  Analyze Instagram profiles and save data
                </p>
              </div>

              <div className="px-4 lg:px-6 space-y-6">
          {/* Scraper Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scrape Instagram Profile</CardTitle>
              <CardDescription>
                Enter an Instagram profile URL to scrape and analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="profileUrl">Instagram Profile URL</Label>
                  <Input
                    id="profileUrl"
                    placeholder="https://www.instagram.com/username/"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleScrape}
                    disabled={loading || !profileUrl}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Instagram className="mr-2 h-4 w-4" />
                        Scrape Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Profiles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Scraped Profiles</CardTitle>
              <CardDescription>
                View all Instagram profiles you've scraped
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProfiles ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Instagram className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No profiles scraped yet</p>
                  <p className="text-sm">Enter a profile URL above to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Following</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Scraped</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {profile.data.username || 'Unknown'}
                            {profile.data.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                ✓
                              </Badge>
                            )}
                            {profile.data.isPrivate && (
                              <Badge variant="outline" className="text-xs">
                                Private
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{profile.data.fullName || '-'}</TableCell>
                        <TableCell>{formatNumber(profile.data.followersCount)}</TableCell>
                        <TableCell>{formatNumber(profile.data.followsCount)}</TableCell>
                        <TableCell>{formatNumber(profile.data.postsCount)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(profile.scrapedAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProfile(profile)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
            <DialogDescription>
              Detailed information about the Instagram profile
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedProfile.data.profilePicUrl && (
                  <img
                    src={selectedProfile.data.profilePicUrl}
                    alt={selectedProfile.data.username}
                    className="w-20 h-20 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {selectedProfile.data.fullName || selectedProfile.data.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{selectedProfile.data.username}
                  </p>
                  {selectedProfile.data.url && (
                    <a
                      href={selectedProfile.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      View on Instagram
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {selectedProfile.data.biography && (
                <div>
                  <Label className="text-xs text-muted-foreground">Bio</Label>
                  <p className="text-sm mt-1">{selectedProfile.data.biography}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Followers
                  </Label>
                  <p className="text-lg font-semibold">
                    {formatNumber(selectedProfile.data.followersCount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Following
                  </Label>
                  <p className="text-lg font-semibold">
                    {formatNumber(selectedProfile.data.followsCount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Image className="h-3 w-3" />
                    Posts
                  </Label>
                  <p className="text-lg font-semibold">
                    {formatNumber(selectedProfile.data.postsCount)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Scraped on
                </Label>
                <p className="text-sm mt-1">{formatDate(selectedProfile.scrapedAt)}</p>
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
