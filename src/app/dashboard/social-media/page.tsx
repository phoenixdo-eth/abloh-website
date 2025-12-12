"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Instagram,
  Loader2,
  Video,
  Upload,
  Calendar,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Share2,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface SocialAccount {
  id: number;
  platform: string;
  username: string;
  avatar_url?: string;
  is_active: boolean;
}

interface Post {
  id: string;
  caption: string;
  status: string;
  scheduled_at?: string;
  created_at: string;
  social_accounts: number[];
}

interface MediaUpload {
  mediaId: string;
  uploadUrl: string;
  file: File;
  uploaded: boolean;
}

export default function SocialMediaPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state
  const [caption, setCaption] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts();
    fetchPosts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await fetch('/api/postbridge/accounts');
      const result = await response.json();

      if (result.success) {
        setAccounts(result.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await fetch('/api/postbridge/posts');
      const result = await response.json();

      if (result.success) {
        setPosts(result.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const mediaIds: string[] = [];

    for (const file of files) {
      try {
        // Get upload URL
        const createResponse = await fetch('/api/postbridge/media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
          }),
        });

        const createResult = await createResponse.json();

        if (!createResult.success) {
          throw new Error(`Failed to create upload URL for ${file.name}`);
        }

        // Upload file to signed URL
        const uploadResponse = await fetch(createResult.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        mediaIds.push(createResult.mediaId);
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        throw err;
      }
    }

    return mediaIds;
  };

  const handleCreatePost = async () => {
    if (!caption.trim()) {
      setError("Caption is required");
      return;
    }

    if (selectedAccounts.length === 0) {
      setError("Please select at least one social account");
      return;
    }

    setPosting(true);
    setError("");

    try {
      let mediaIds: string[] = [];

      // Upload files if any
      if (files.length > 0) {
        setUploading(true);
        mediaIds = await uploadFiles();
        setUploading(false);
      }

      // Create post
      const response = await fetch('/api/postbridge/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption,
          socialAccounts: selectedAccounts,
          scheduledAt: scheduledAt || null,
          media: mediaIds.length > 0 ? mediaIds : undefined,
          isDraft,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Reset form
        setCaption("");
        setSelectedAccounts([]);
        setScheduledAt("");
        setIsDraft(false);
        setFiles([]);
        setCreateDialogOpen(false);

        // Refresh posts
        fetchPosts();
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (error) {
      setError('An error occurred while creating the post');
      console.error('Post creation error:', error);
    } finally {
      setPosting(false);
      setUploading(false);
    }
  };

  const toggleAccountSelection = (accountId: number) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
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

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok':
        return <Video className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
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
                <h1 className="text-2xl font-bold tracking-tight">Social Media Manager</h1>
                <p className="text-sm text-muted-foreground">
                  Post to TikTok and Instagram, track performance
                </p>
              </div>

              <div className="px-4 lg:px-6 space-y-6">
          {/* Connected Accounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>
                    Manage your TikTok and Instagram accounts
                  </CardDescription>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                      <DialogDescription>
                        Post to your connected social media accounts
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {/* Caption */}
                      <div>
                        <Label htmlFor="caption">Caption</Label>
                        <Textarea
                          id="caption"
                          placeholder="Write your caption..."
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          rows={4}
                          disabled={posting}
                        />
                      </div>

                      {/* Account Selection */}
                      <div>
                        <Label>Select Accounts</Label>
                        <div className="mt-2 space-y-2">
                          {loadingAccounts ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading accounts...
                            </div>
                          ) : accounts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No connected accounts. Please connect your accounts first.
                            </p>
                          ) : (
                            accounts.map((account) => (
                              <div key={account.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={`account-${account.id}`}
                                  checked={selectedAccounts.includes(account.id)}
                                  onCheckedChange={() => toggleAccountSelection(account.id)}
                                  disabled={posting}
                                />
                                <label
                                  htmlFor={`account-${account.id}`}
                                  className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {getPlatformIcon(account.platform)}
                                  {account.username}
                                  <Badge variant="secondary" className="text-xs">
                                    {account.platform}
                                  </Badge>
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Media Upload */}
                      <div>
                        <Label htmlFor="media">Media (optional)</Label>
                        <Input
                          id="media"
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,video/mp4,video/quicktime"
                          onChange={handleFileChange}
                          disabled={posting}
                        />
                        {files.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {files.length} file(s) selected
                          </p>
                        )}
                      </div>

                      {/* Schedule */}
                      <div>
                        <Label htmlFor="schedule">Schedule (optional)</Label>
                        <Input
                          id="schedule"
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          disabled={posting}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to post immediately
                        </p>
                      </div>

                      {/* Draft */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="draft"
                          checked={isDraft}
                          onCheckedChange={(checked) => setIsDraft(checked as boolean)}
                          disabled={posting}
                        />
                        <label
                          htmlFor="draft"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Save as draft
                        </label>
                      </div>

                      {error && (
                        <p className="text-sm text-destructive">{error}</p>
                      )}

                      <Button
                        onClick={handleCreatePost}
                        disabled={posting || uploading}
                        className="w-full"
                      >
                        {uploading ? (
                          <>
                            <Upload className="mr-2 h-4 w-4 animate-pulse" />
                            Uploading media...
                          </>
                        ) : posting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating post...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {isDraft ? 'Save Draft' : (scheduledAt ? 'Schedule Post' : 'Post Now')}
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAccounts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Share2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No connected accounts</p>
                  <p className="text-sm">Connect your TikTok and Instagram accounts to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <Card key={account.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          {account.avatar_url && (
                            <img
                              src={account.avatar_url}
                              alt={account.username}
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(account.platform)}
                              <h4 className="font-semibold">{account.username}</h4>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {account.platform}
                              </Badge>
                              {account.is_active && (
                                <Badge variant="outline" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post History */}
          <Card>
            <CardHeader>
              <CardTitle>Post History</CardTitle>
              <CardDescription>
                View and manage your posted content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No posts yet</p>
                  <p className="text-sm">Create your first post to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm line-clamp-2">{post.caption}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(post.status)}
                          {getStatusBadge(post.status)}
                          {post.scheduled_at && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(post.scheduled_at).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
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
