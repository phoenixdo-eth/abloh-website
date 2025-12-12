"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Sparkles,
  Video,
  Image as ImageIcon,
  Music,
  Download,
  Share2,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  Plus,
  Instagram,
  TrendingUp,
} from "lucide-react";

// Model configuration type
interface ModelConfig {
  label: string;
  source: string;
  type: string;
  api: string;
  description: string;
  requiresImage?: boolean;
}

// Model configurations with API source
const MODELS: Record<string, ModelConfig> = {
  // Runway Models
  'runway-gen4-image': {
    label: 'Gen-4 Image',
    source: 'Runway',
    type: 'image',
    api: 'runway',
    description: 'High-quality text-to-image generation',
  },
  'runway-gen4-turbo-video': {
    label: 'Gen-4 Turbo Video',
    source: 'Runway',
    type: 'video',
    api: 'runway',
    description: 'Fast video generation from text',
  },
  'runway-image-to-video': {
    label: 'Image to Video',
    source: 'Runway',
    type: 'video',
    api: 'runway',
    description: 'Convert images to videos',
    requiresImage: true,
  },

  // Kie Models - Video
  'kie-veo-3.1': {
    label: 'Veo 3.1',
    source: 'Kie',
    type: 'video',
    api: 'kie',
    description: 'Google\'s advanced video generation model',
  },
  'kie-runway-gen3': {
    label: 'Runway Gen-3 Alpha',
    source: 'Kie',
    type: 'video',
    api: 'kie',
    description: 'Runway Gen-3 via Kie API',
  },

  // Kie Models - Image
  'kie-flux-1.1-pro': {
    label: 'Flux 1.1 Pro',
    source: 'Kie',
    type: 'image',
    api: 'kie',
    description: 'Professional image generation',
  },
  'kie-flux-kontext': {
    label: 'Flux Kontext',
    source: 'Kie',
    type: 'image',
    api: 'kie',
    description: 'Context-aware image generation',
  },
  'kie-imagen4': {
    label: 'Google Imagen 4',
    source: 'Kie',
    type: 'image',
    api: 'kie',
    description: 'Google\'s latest image generation model',
  },

  // Kie Models - Audio
  'kie-elevenlabs-tts': {
    label: 'ElevenLabs TTS',
    source: 'Kie',
    type: 'audio',
    api: 'kie',
    description: 'Text-to-speech synthesis',
  },
};

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

export default function AIGeneratorPage() {
  const [selectedModel, setSelectedModel] = useState("runway-gen4-image");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ratio, setRatio] = useState("1360:768");
  const [duration, setDuration] = useState("5");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [error, setError] = useState("");

  const currentModel = MODELS[selectedModel as keyof typeof MODELS];

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      setLoadingHistory(true);
      const [runwayRes, kieRes] = await Promise.all([
        fetch('/api/runway/generate'),
        fetch('/api/kie/generate'),
      ]);

      const runwayData = await runwayRes.json();
      const kieData = await kieRes.json();

      const allGenerations = [
        ...(runwayData.success ? runwayData.generations.map((g: Generation) => ({ ...g, source: 'Runway' })) : []),
        ...(kieData.success ? kieData.generations.map((g: Generation) => ({ ...g, source: 'Kie' })) : []),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setGenerations(allGenerations);
    } catch (error) {
      console.error('Error fetching generations:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    if (currentModel.requiresImage && !imageUrl) {
      setError("Please provide an image URL for this model");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = currentModel.api === 'runway' ? '/api/runway/generate' : '/api/kie/generate';

      let requestBody;

      if (currentModel.api === 'runway') {
        requestBody = {
          type: currentModel.type === 'image' ? 'text_to_image' :
                currentModel.requiresImage ? 'image_to_video' : 'text_to_video',
          promptText: prompt,
          imageUrl: currentModel.requiresImage ? imageUrl : undefined,
          ratio: currentModel.type === 'image' ? ratio : undefined,
        };
      } else {
        // Kie API
        const modelName = selectedModel.replace('kie-', '');
        requestBody = {
          type: currentModel.type,
          prompt,
          model: modelName,
          imageUrl: currentModel.requiresImage ? imageUrl : undefined,
          duration: currentModel.type === 'video' ? parseInt(duration) : undefined,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPrompt("");
        setImageUrl("");
        fetchGenerations();
      } else {
        setError(result.error || 'Failed to generate content');
      }
    } catch (error) {
      setError('An error occurred during generation');
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
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

  const getGenerationUrl = (gen: Generation): string | undefined => {
    return gen.output?.url || gen.output?.data?.[0]?.url;
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-bold tracking-tight">AI Content Generator</h1>
                <p className="text-sm text-muted-foreground">
                  Generate images, videos, and audio with multiple AI models
                </p>
              </div>

              <div className="px-4 lg:px-6 space-y-6">
          {/* Generator Card */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Generation</CardTitle>
              <CardDescription>
                Select a model and describe what you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={loading}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Runway Models</SelectLabel>
                      {Object.entries(MODELS)
                        .filter(([_, model]) => model.source === 'Runway')
                        .map(([key, model]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {model.type === 'image' && <ImageIcon className="h-4 w-4" />}
                              {model.type === 'video' && <Video className="h-4 w-4" />}
                              {model.label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Kie Models - Video</SelectLabel>
                      {Object.entries(MODELS)
                        .filter(([_, model]) => model.source === 'Kie' && model.type === 'video')
                        .map(([key, model]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              {model.label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Kie Models - Image</SelectLabel>
                      {Object.entries(MODELS)
                        .filter(([_, model]) => model.source === 'Kie' && model.type === 'image')
                        .map(([key, model]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              {model.label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Kie Models - Audio</SelectLabel>
                      {Object.entries(MODELS)
                        .filter(([_, model]) => model.source === 'Kie' && model.type === 'audio')
                        .map(([key, model]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Music className="h-4 w-4" />
                              {model.label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{currentModel.source} API</Badge>
                  <p className="text-xs text-muted-foreground">{currentModel.description}</p>
                </div>
              </div>

              <Separator />

              {/* Image URL (if required) */}
              {currentModel.requiresImage && (
                <div className="space-y-2">
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder={
                    currentModel.type === 'image'
                      ? "A serene landscape with mountains and a lake at sunset..."
                      : currentModel.type === 'video'
                      ? "A cinematic shot of waves crashing on a beach..."
                      : "Your text to convert to speech..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-2 gap-4">
                {currentModel.type === 'image' && currentModel.api === 'runway' && (
                  <div className="space-y-2">
                    <Label htmlFor="ratio">Aspect Ratio</Label>
                    <Select value={ratio} onValueChange={setRatio} disabled={loading}>
                      <SelectTrigger id="ratio">
                        <SelectValue placeholder="Select ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1360:768">16:9 Landscape</SelectItem>
                        <SelectItem value="768:1360">9:16 Portrait</SelectItem>
                        <SelectItem value="1024:1024">1:1 Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentModel.type === 'video' && currentModel.api === 'kie' && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Select value={duration} onValueChange={setDuration} disabled={loading}>
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with {currentModel.source}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* History Card */}
          <Card>
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
              <CardDescription>
                All your AI-generated content from both Runway and Kie
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : generations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No generations yet</p>
                  <p className="text-sm">Create your first generation above</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generations.map((gen) => {
                    const genUrl = getGenerationUrl(gen);
                    return (
                      <div key={gen.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {gen.source || 'Unknown'}
                              </Badge>
                              {gen.type && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {gen.type}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(gen.createdAt)}
                            </p>
                          </div>
                          {genUrl && (
                            <a
                              href={genUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <Separator />
                        <p className="text-sm line-clamp-3">{gen.promptText || gen.prompt}</p>
                        {genUrl && (
                          <div className="mt-2">
                            {gen.type === 'video' ? (
                              <video
                                src={genUrl}
                                controls
                                className="w-full rounded-md"
                              />
                            ) : gen.type === 'image' ? (
                              <img
                                src={genUrl}
                                alt={gen.promptText || gen.prompt || 'Generated image'}
                                className="w-full rounded-md"
                              />
                            ) : (
                              <audio
                                src={genUrl}
                                controls
                                className="w-full"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
  );
}
