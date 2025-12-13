"use client"

import { useState, useRef, useEffect } from "react"
import { Player } from "@remotion/player"
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ZoomInIcon,
  ZoomOutIcon,
  PlusIcon,
  UploadIcon,
  TypeIcon,
  VolumeIcon,
  ImageIcon,
  VideoIcon,
  TrashIcon,
  MoveIcon,
} from "lucide-react"
import { VideoComposition } from "./VideoComposition"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { EditorChatbot } from "@/components/editor-chatbot"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

// Types
interface MediaAsset {
  id: string
  type: "video" | "image" | "audio"
  url: string
  name: string
  duration?: number
  thumbnail?: string
}

interface TimelineClip {
  id: string
  assetId: string
  track: number
  startTime: number
  duration: number
  x: number
  y: number
  width: number
  height: number
  volume?: number
}

interface Caption {
  id: string
  text: string
  startTime: number
  duration: number
  style: {
    fontSize: number
    color: string
    backgroundColor: string
  }
}

// Aspect ratio presets
const ASPECT_RATIOS = {
  "16:9": { width: 1920, height: 1080, label: "YouTube (16:9)" },
  "9:16": { width: 1080, height: 1920, label: "TikTok/Reels (9:16)" },
  "1:1": { width: 1080, height: 1080, label: "Instagram Square (1:1)" },
  "4:5": { width: 1080, height: 1350, label: "Instagram Portrait (4:5)" },
  "21:9": { width: 2560, height: 1080, label: "Ultrawide (21:9)" },
}

export default function EditingPage() {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [videoClips, setVideoClips] = useState<TimelineClip[]>([])
  const [audioClips, setAudioClips] = useState<TimelineClip[]>([])
  const [captions, setCaptions] = useState<Caption[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [selectedClip, setSelectedClip] = useState<string | null>(null)
  const [duration, setDuration] = useState(30) // 30 seconds default
  const [draggedClip, setDraggedClip] = useState<{ id: string; type: "video" | "audio" | "caption"; offsetX: number } | null>(null)
  const [draggedAsset, setDraggedAsset] = useState<MediaAsset | null>(null)
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<keyof typeof ASPECT_RATIOS>("16:9")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStage, setExportStage] = useState("")
  const playerRef = useRef<any>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const TRACK_HEIGHT = 80
  const PIXEL_PER_SECOND = 50 * zoom
  const currentAspectRatio = ASPECT_RATIOS[aspectRatio]

  // Generate video thumbnail
  const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      video.src = videoUrl
      video.crossOrigin = "anonymous"
      video.currentTime = 1 // Seek to 1 second

      video.onloadeddata = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 320
        canvas.height = 180
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL())
        }
      }

      video.onerror = () => {
        resolve("") // Return empty string on error
      }
    })
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "image"

      let thumbnail = type === "image" ? url : undefined

      // Generate thumbnail for video
      if (type === "video") {
        thumbnail = await generateVideoThumbnail(url)
      }

      const newAsset: MediaAsset = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        url,
        name: file.name,
        thumbnail,
      }

      setMediaAssets((prev) => [...prev, newAsset])
    }
  }

  // Add clip to timeline
  const addClipToTimeline = (asset: MediaAsset) => {
    const newClip: TimelineClip = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: asset.id,
      track: asset.type === "audio" ? 1 : 0,
      startTime: currentTime,
      duration: asset.duration || 5,
      x: 0,
      y: 0,
      width: currentAspectRatio.width,
      height: currentAspectRatio.height,
      volume: 100,
    }

    if (asset.type === "audio") {
      setAudioClips((prev) => [...prev, newClip])
    } else {
      setVideoClips((prev) => [...prev, newClip])
    }

    // Extend duration if needed
    const endTime = newClip.startTime + newClip.duration
    if (endTime > duration) {
      setDuration(endTime)
    }
  }

  // Add caption
  const addCaption = () => {
    const newCaption: Caption = {
      id: Math.random().toString(36).substr(2, 9),
      text: "New Caption",
      startTime: currentTime,
      duration: 3,
      style: {
        fontSize: 48,
        color: "#ffffff",
        backgroundColor: "#000000",
      },
    }
    setCaptions((prev) => [...prev, newCaption])
  }

  // Delete clip
  const deleteClip = (clipId: string) => {
    setVideoClips((prev) => prev.filter((c) => c.id !== clipId))
    setAudioClips((prev) => prev.filter((c) => c.id !== clipId))
    setCaptions((prev) => prev.filter((c) => c.id !== clipId))
    if (selectedClip === clipId) {
      setSelectedClip(null)
    }
  }

  // Drag handlers
  const handleClipMouseDown = (e: React.MouseEvent, clipId: string, type: "video" | "audio" | "caption", startTime: number) => {
    e.stopPropagation()
    const offsetX = e.clientX - (startTime * PIXEL_PER_SECOND)
    setDraggedClip({ id: clipId, type, offsetX })
    setSelectedClip(clipId)
  }

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    // Handle playhead dragging
    if (isDraggingPlayhead) {
      handlePlayheadDrag(e)
      return
    }

    // Handle clip dragging
    if (!draggedClip || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - draggedClip.offsetX
    const newStartTime = Math.max(0, x / PIXEL_PER_SECOND)

    if (draggedClip.type === "video") {
      setVideoClips((prev) =>
        prev.map((c) => (c.id === draggedClip.id ? { ...c, startTime: newStartTime } : c))
      )
    } else if (draggedClip.type === "audio") {
      setAudioClips((prev) =>
        prev.map((c) => (c.id === draggedClip.id ? { ...c, startTime: newStartTime } : c))
      )
    } else if (draggedClip.type === "caption") {
      setCaptions((prev) =>
        prev.map((c) => (c.id === draggedClip.id ? { ...c, startTime: newStartTime } : c))
      )
    }
  }

  const handleTimelineMouseUp = () => {
    setDraggedClip(null)
    handlePlayheadMouseUp()
  }

  // Click timeline to set playhead position
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || draggedClip || isDraggingPlayhead) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newTime = Math.max(0, Math.min(duration, x / PIXEL_PER_SECOND))
    setCurrentTime(newTime)
  }

  // Playhead drag handlers
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDraggingPlayhead(true)
  }

  const handlePlayheadDrag = (e: React.MouseEvent) => {
    if (!isDraggingPlayhead || !timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newTime = Math.max(0, Math.min(duration, x / PIXEL_PER_SECOND))
    setCurrentTime(newTime)

    // Seek player if it exists
    if (playerRef.current) {
      playerRef.current.seekTo(Math.floor(newTime * 30))
    }
  }

  const handlePlayheadMouseUp = () => {
    setIsDraggingPlayhead(false)
  }

  // Drag handlers for assets
  const handleAssetDragStart = (e: React.DragEvent, asset: MediaAsset) => {
    setDraggedAsset(asset)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleAssetDragEnd = () => {
    setDraggedAsset(null)
  }

  const handleTimelineDrop = (e: React.DragEvent, track: number) => {
    e.preventDefault()
    if (!draggedAsset || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const dropTime = Math.max(0, x / PIXEL_PER_SECOND)

    const newClip: TimelineClip = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: draggedAsset.id,
      track,
      startTime: dropTime,
      duration: draggedAsset.duration || 5,
      x: 0,
      y: 0,
      width: currentAspectRatio.width,
      height: currentAspectRatio.height,
      volume: 100,
    }

    if (draggedAsset.type === "audio") {
      setAudioClips((prev) => [...prev, newClip])
    } else {
      setVideoClips((prev) => [...prev, newClip])
    }

    // Extend duration if needed
    const endTime = newClip.startTime + newClip.duration
    if (endTime > duration) {
      setDuration(endTime)
    }

    setDraggedAsset(null)
  }

  const handleTimelineDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  // Play/Pause control
  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Sync playhead with player current time
  useEffect(() => {
    if (!playerRef.current || !isPlaying) return

    const interval = setInterval(() => {
      if (playerRef.current) {
        const frame = playerRef.current.getCurrentFrame()
        setCurrentTime(frame / 30) // Convert frame to seconds (30fps)
      }
    }, 1000 / 30) // Update 30 times per second to match fps

    return () => clearInterval(interval)
  }, [isPlaying])

  // Handle global mouse events for playhead dragging
  useEffect(() => {
    if (!isDraggingPlayhead) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newTime = Math.max(0, Math.min(duration, x / PIXEL_PER_SECOND))
      setCurrentTime(newTime)

      // Seek player if it exists
      if (playerRef.current) {
        playerRef.current.seekTo(Math.floor(newTime * 30))
      }
    }

    const handleGlobalMouseUp = () => {
      setIsDraggingPlayhead(false)
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDraggingPlayhead, duration, PIXEL_PER_SECOND])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * 30)
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
  }

  // Export video
  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportStage("Initializing export...")

    try {
      // Simulate export process with realistic stages
      const stages = [
        { stage: "Analyzing composition...", duration: 500 },
        { stage: "Rendering video frames...", duration: 3000 },
        { stage: "Processing audio tracks...", duration: 1500 },
        { stage: "Encoding video...", duration: 2000 },
        { stage: "Finalizing export...", duration: 1000 },
      ]

      let totalProgress = 0
      const progressPerStage = 100 / stages.length

      for (let i = 0; i < stages.length; i++) {
        setExportStage(stages[i].stage)
        const stageStartProgress = totalProgress

        // Simulate progress within each stage
        const steps = 10
        for (let j = 0; j <= steps; j++) {
          await new Promise(resolve => setTimeout(resolve, stages[i].duration / steps))
          const stageProgress = (j / steps) * progressPerStage
          setExportProgress(Math.min(100, stageStartProgress + stageProgress))
        }

        totalProgress += progressPerStage
      }

      // Create a mock video file (in real implementation, this would be the rendered video)
      setExportStage("Downloading...")
      const blob = new Blob([""], { type: "video/mp4" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportProgress(100)
      setExportStage("Export complete!")

      // Close dialog after 1 second
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        setExportStage("")
      }, 1000)
    } catch (error) {
      console.error("Export failed:", error)
      setExportStage("Export failed")
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        setExportStage("")
      }, 2000)
    }
  }

  // Check if there's content to export
  const hasContent = videoClips.length > 0 || audioClips.length > 0 || captions.length > 0

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Video Editor</h1>
                    <p className="text-sm text-muted-foreground">
                      Create and edit videos with multi-track timeline
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as keyof typeof ASPECT_RATIOS)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                    <Button onClick={handleExport} disabled={!hasContent || isExporting}>
                      Export Video
                    </Button>
                  </div>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <div className="flex gap-4 h-[calc(100vh-280px)]">
                  {/* Left Sidebar - Media Library */}
                  <div className="w-80 border rounded-lg bg-muted/30 overflow-y-auto">
                    <Tabs defaultValue="media" className="w-full">
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="media">Media</TabsTrigger>
                        <TabsTrigger value="effects">Effects</TabsTrigger>
                      </TabsList>
                      <TabsContent value="media" className="p-4 space-y-4">
                        <div>
                          <Label htmlFor="file-upload" className="cursor-pointer">
                            <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg hover:border-primary transition-colors p-6">
                              <div className="text-center">
                                <UploadIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                  Click to upload
                                </p>
                              </div>
                            </div>
                            <Input
                              id="file-upload"
                              type="file"
                              multiple
                              accept="video/*,audio/*,image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold">Assets</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {mediaAssets.map((asset) => (
                              <Card
                                key={asset.id}
                                className="p-2 cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
                                draggable
                                onDragStart={(e) => handleAssetDragStart(e, asset)}
                                onDragEnd={handleAssetDragEnd}
                                onClick={() => addClipToTimeline(asset)}
                              >
                                <div className="aspect-video bg-black rounded flex items-center justify-center mb-2 overflow-hidden relative">
                                  {asset.thumbnail ? (
                                    <img
                                      src={asset.thumbnail}
                                      alt={asset.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : asset.type === "video" ? (
                                    <VideoIcon className="h-6 w-6 text-muted-foreground" />
                                  ) : asset.type === "image" ? (
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                  ) : (
                                    <VolumeIcon className="h-6 w-6 text-muted-foreground" />
                                  )}
                                  {asset.type === "video" && (
                                    <div className="absolute top-1 right-1 bg-black/60 rounded px-1">
                                      <VideoIcon className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                  {asset.type === "audio" && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                      <VolumeIcon className="h-8 w-8 text-white" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs truncate">{asset.name}</p>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="effects" className="p-4 space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold mb-2">Filters</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded mb-2" />
                                <p className="text-xs font-medium">Brightness</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 rounded mb-2" />
                                <p className="text-xs font-medium">Contrast</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-pink-400 to-pink-600 rounded mb-2" />
                                <p className="text-xs font-medium">Saturation</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-gray-300 to-gray-500 rounded mb-2 backdrop-blur-sm" />
                                <p className="text-xs font-medium">Blur</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-amber-400 to-amber-600 rounded mb-2" />
                                <p className="text-xs font-medium">Sepia</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-400 rounded mb-2" />
                                <p className="text-xs font-medium">Grayscale</p>
                              </Card>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Transitions</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-r from-black via-gray-500 to-white rounded mb-2" />
                                <p className="text-xs font-medium">Fade</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-r from-transparent to-black rounded mb-2 border" />
                                <p className="text-xs font-medium">Dissolve</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2" />
                                <p className="text-xs font-medium">Wipe</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded mb-2" />
                                <p className="text-xs font-medium">Cross Fade</p>
                              </Card>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Speed</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-green-400 to-green-600 rounded mb-2 flex items-center justify-center">
                                  <span className="text-white font-bold text-xl">0.5×</span>
                                </div>
                                <p className="text-xs font-medium">Slow Motion</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-red-400 to-red-600 rounded mb-2 flex items-center justify-center">
                                  <span className="text-white font-bold text-xl">2×</span>
                                </div>
                                <p className="text-xs font-medium">Fast Forward</p>
                              </Card>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Transform</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-cyan-400 to-cyan-600 rounded mb-2 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">↻ 90°</span>
                                </div>
                                <p className="text-xs font-medium">Rotate</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-teal-400 to-teal-600 rounded mb-2 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">⇄</span>
                                </div>
                                <p className="text-xs font-medium">Flip</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-orange-400 to-orange-600 rounded mb-2 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">⊕</span>
                                </div>
                                <p className="text-xs font-medium">Zoom</p>
                              </Card>
                              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                                <div className="aspect-video bg-gradient-to-br from-violet-400 to-violet-600 rounded mb-2 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">✂</span>
                                </div>
                                <p className="text-xs font-medium">Crop</p>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col overflow-hidden border rounded-lg">
                    {/* Preview Panel */}
                    <div className="flex-1 bg-black/90 flex items-center justify-center p-4 overflow-hidden relative">
                      {/* Aspect Ratio Badge */}
                      <div className="absolute top-6 left-6 z-20 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
                        <p className="text-xs font-medium text-white">
                          {currentAspectRatio.label}
                        </p>
                        <p className="text-[10px] text-white/60">
                          {currentAspectRatio.width} × {currentAspectRatio.height}
                        </p>
                      </div>

                      <div
                        className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center border-2 border-white/10"
                        style={{
                          aspectRatio: `${currentAspectRatio.width} / ${currentAspectRatio.height}`,
                          maxWidth: "100%",
                          maxHeight: "100%",
                          width: aspectRatio === "9:16" || aspectRatio === "4:5" ? "auto" : "100%",
                          height: aspectRatio === "9:16" || aspectRatio === "4:5" ? "100%" : "auto",
                        }}
                      >
                        {videoClips.length > 0 || audioClips.length > 0 || captions.length > 0 ? (
                          <Player
                            ref={playerRef}
                            component={VideoComposition}
                            inputProps={{
                              mediaAssets,
                              videoClips,
                              audioClips,
                              captions,
                              fps: 30,
                              width: currentAspectRatio.width,
                              height: currentAspectRatio.height,
                            }}
                            durationInFrames={Math.ceil(duration * 30)}
                            fps={30}
                            compositionWidth={currentAspectRatio.width}
                            compositionHeight={currentAspectRatio.height}
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                            controls
                            loop
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-center">
                              <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p className="text-muted-foreground">
                                Add clips to timeline to preview
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {currentAspectRatio.label}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="border-t p-2 bg-background">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <SkipBackIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={togglePlayPause}
                          >
                            {isPlaying ? (
                              <PauseIcon className="h-3 w-3" />
                            ) : (
                              <PlayIcon className="h-3 w-3" />
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            <SkipForwardIcon className="h-3 w-3" />
                          </Button>
                          <span className="ml-2 font-mono text-xs">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={addCaption}>
                            <TypeIcon className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                            >
                              <ZoomOutIcon className="h-3 w-3" />
                            </Button>
                            <span className="text-xs w-10 text-center">
                              {Math.round(zoom * 100)}%
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                            >
                              <ZoomInIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 bg-muted/20 overflow-auto">
                      <div className="p-2">
                        <div
                          ref={timelineRef}
                          className="relative"
                          style={{ minWidth: duration * PIXEL_PER_SECOND }}
                          onMouseMove={handleTimelineMouseMove}
                          onMouseUp={handleTimelineMouseUp}
                          onMouseLeave={handleTimelineMouseUp}
                        >
                {/* Time Ruler */}
                <div className="h-8 border-b flex relative bg-background mb-2">
                  {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute border-l border-border"
                      style={{ left: i * PIXEL_PER_SECOND }}
                    >
                      <span className="text-xs ml-1">{i}s</span>
                    </div>
                  ))}
                </div>

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 z-10 group cursor-ew-resize"
                  style={{ left: currentTime * PIXEL_PER_SECOND }}
                  onMouseDown={handlePlayheadMouseDown}
                >
                  {/* Playhead line */}
                  <div className="absolute inset-y-0 -left-[1px] w-0.5 bg-primary pointer-events-none" />
                  {/* Draggable handle at top */}
                  <div className="absolute -top-1 -left-2 w-4 h-4 bg-primary rounded-sm shadow-lg group-hover:scale-110 transition-transform" />
                </div>

                {/* Video Tracks - Rendered top to bottom (track 2 at top, track 0 at bottom) */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold w-16">VIDEO</span>
                  </div>
                  {[2, 1, 0].map((track) => (
                    <div
                      key={`video-${track}`}
                      className="relative bg-muted/40 rounded group"
                      style={{ height: TRACK_HEIGHT, minWidth: duration * PIXEL_PER_SECOND }}
                      onDrop={(e) => handleTimelineDrop(e, track)}
                      onDragOver={handleTimelineDragOver}
                    >
                      {/* Track label indicator */}
                      <div className="absolute left-2 top-2 z-20 opacity-50 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-medium text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
                          {track === 2 ? "Top" : track === 1 ? "Mid" : "Bottom"}
                        </span>
                      </div>
                      {videoClips
                        .filter((clip) => clip.track === track)
                        .map((clip) => {
                          const asset = mediaAssets.find((a) => a.id === clip.assetId)
                          return (
                            <div
                              key={clip.id}
                              className={`absolute top-1 bottom-1 bg-blue-500/80 rounded border-2 cursor-move hover:bg-blue-500 transition-colors ${
                                selectedClip === clip.id
                                  ? "border-primary"
                                  : "border-blue-600"
                              }`}
                              style={{
                                left: clip.startTime * PIXEL_PER_SECOND,
                                width: clip.duration * PIXEL_PER_SECOND,
                              }}
                              onMouseDown={(e) => handleClipMouseDown(e, clip.id, "video", clip.startTime)}
                              onClick={() => setSelectedClip(clip.id)}
                            >
                              <div className="p-2 text-xs text-white truncate">
                                {asset?.name}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteClip(clip.id)
                                }}
                              >
                                <TrashIcon className="h-3 w-3 text-white" />
                              </Button>
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>

                {/* Audio Tracks */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold w-16">AUDIO</span>
                  </div>
                  {[0, 1].map((track) => (
                    <div
                      key={`audio-${track}`}
                      className="relative bg-muted/40 rounded"
                      style={{ height: TRACK_HEIGHT / 2, minWidth: duration * PIXEL_PER_SECOND }}
                      onDrop={(e) => handleTimelineDrop(e, track)}
                      onDragOver={handleTimelineDragOver}
                    >
                      {audioClips
                        .filter((clip) => clip.track === track)
                        .map((clip) => {
                          const asset = mediaAssets.find((a) => a.id === clip.assetId)
                          return (
                            <div
                              key={clip.id}
                              className={`absolute top-1 bottom-1 bg-green-500/80 rounded border-2 cursor-move hover:bg-green-500 transition-colors ${
                                selectedClip === clip.id
                                  ? "border-primary"
                                  : "border-green-600"
                              }`}
                              style={{
                                left: clip.startTime * PIXEL_PER_SECOND,
                                width: clip.duration * PIXEL_PER_SECOND,
                              }}
                              onMouseDown={(e) => handleClipMouseDown(e, clip.id, "audio", clip.startTime)}
                              onClick={() => setSelectedClip(clip.id)}
                            >
                              <div className="p-1 text-xs text-white truncate">
                                {asset?.name}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>

                {/* Caption Track */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold w-16">CAPTIONS</span>
                  </div>
                  <div
                    className="relative bg-muted/40 rounded"
                    style={{ height: TRACK_HEIGHT / 2, minWidth: duration * PIXEL_PER_SECOND }}
                  >
                    {captions.map((caption) => (
                      <div
                        key={caption.id}
                        className={`absolute top-1 bottom-1 bg-purple-500/80 rounded border-2 cursor-move hover:bg-purple-500 transition-colors ${
                          selectedClip === caption.id
                            ? "border-primary"
                            : "border-purple-600"
                        }`}
                        style={{
                          left: caption.startTime * PIXEL_PER_SECOND,
                          width: caption.duration * PIXEL_PER_SECOND,
                        }}
                        onMouseDown={(e) => handleClipMouseDown(e, caption.id, "caption", caption.startTime)}
                        onClick={() => setSelectedClip(caption.id)}
                      >
                        <div className="p-1 text-xs text-white truncate">
                          {caption.text}
                        </div>
                      </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Properties */}
                {selectedClip && (() => {
                  const videoClip = videoClips.find((c) => c.id === selectedClip)
                  const audioClip = audioClips.find((c) => c.id === selectedClip)
                  const caption = captions.find((c) => c.id === selectedClip)
                  const clip = videoClip || audioClip

                  return (
                    <div className="w-80 border rounded-lg bg-muted/30 overflow-y-auto p-4">
                      <h3 className="font-semibold mb-4">Properties</h3>
                      <div className="space-y-4">
                        {clip && (
                          <>
                            <div>
                              <Label>Layer (Track)</Label>
                              <Select
                                value={clip.track.toString()}
                                onValueChange={(value) => {
                                  const newTrack = parseInt(value)
                                  if (videoClip) {
                                    setVideoClips((prev) =>
                                      prev.map((c) =>
                                        c.id === selectedClip ? { ...c, track: newTrack } : c
                                      )
                                    )
                                  } else if (audioClip) {
                                    setAudioClips((prev) =>
                                      prev.map((c) =>
                                        c.id === selectedClip ? { ...c, track: newTrack } : c
                                      )
                                    )
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {videoClip && (
                                    <>
                                      <SelectItem value="0">Track 1 (Bottom)</SelectItem>
                                      <SelectItem value="1">Track 2 (Middle)</SelectItem>
                                      <SelectItem value="2">Track 3 (Top)</SelectItem>
                                    </>
                                  )}
                                  {audioClip && (
                                    <>
                                      <SelectItem value="0">Track 1</SelectItem>
                                      <SelectItem value="1">Track 2</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground mt-1">
                                Higher tracks appear in front
                              </p>
                            </div>

                            <div>
                              <Label>Position & Size</Label>
                              <div className="flex gap-2 mb-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (videoClip) {
                                      setVideoClips((prev) =>
                                        prev.map((c) =>
                                          c.id === selectedClip
                                            ? {
                                                ...c,
                                                x: 0,
                                                y: 0,
                                                width: currentAspectRatio.width,
                                                height: currentAspectRatio.height,
                                              }
                                            : c
                                        )
                                      )
                                    }
                                  }}
                                >
                                  Fill
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (videoClip) {
                                      const pipWidth = Math.floor(currentAspectRatio.width * 0.3)
                                      const pipHeight = Math.floor(currentAspectRatio.height * 0.3)
                                      setVideoClips((prev) =>
                                        prev.map((c) =>
                                          c.id === selectedClip
                                            ? {
                                                ...c,
                                                x: currentAspectRatio.width - pipWidth - 20,
                                                y: currentAspectRatio.height - pipHeight - 20,
                                                width: pipWidth,
                                                height: pipHeight,
                                              }
                                            : c
                                        )
                                      )
                                    }
                                  }}
                                >
                                  PiP
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">X</Label>
                          <Input
                            type="number"
                            value={clip.x}
                            onChange={(e) => {
                              const newX = parseInt(e.target.value) || 0
                              if (videoClip) {
                                setVideoClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip ? { ...c, x: newX } : c
                                  )
                                )
                              } else if (audioClip) {
                                setAudioClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip ? { ...c, x: newX } : c
                                  )
                                )
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y</Label>
                          <Input
                            type="number"
                            value={clip.y}
                            onChange={(e) => {
                              const newY = parseInt(e.target.value) || 0
                              if (videoClip) {
                                setVideoClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip ? { ...c, y: newY } : c
                                  )
                                )
                              } else if (audioClip) {
                                setAudioClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip ? { ...c, y: newY } : c
                                  )
                                )
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={clip.width}
                            onChange={(e) => {
                              const newWidth = parseInt(e.target.value) || 1920
                              if (videoClip) {
                                setVideoClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip ? { ...c, width: newWidth } : c
                                  )
                                )
                              } else if (audioClip) {
                                setAudioClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip ? { ...c, width: newWidth } : c
                                  )
                                )
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={clip.height}
                            onChange={(e) => {
                              const newHeight = parseInt(e.target.value) || 1080
                              if (videoClip) {
                                setVideoClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip ? { ...c, height: newHeight } : c
                                  )
                                )
                              } else if (audioClip) {
                                setAudioClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip ? { ...c, height: newHeight } : c
                                  )
                                )
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Volume</Label>
                      <Slider
                        value={[clip.volume || 100]}
                        max={100}
                        step={1}
                        className="mt-2"
                        onValueChange={(value) => {
                          if (videoClip) {
                            setVideoClips((prev) =>
                              prev.map((c) =>
                                c.id === selectedClip ? { ...c, volume: value[0] } : c
                              )
                            )
                          } else if (audioClip) {
                            setAudioClips((prev) =>
                              prev.map((c) =>
                                c.id === selectedClip ? { ...c, volume: value[0] } : c
                              )
                            )
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        {clip.volume || 100}%
                      </span>
                    </div>

                    <div>
                      <Label>Duration (seconds)</Label>
                      <Input
                        type="number"
                        value={clip.duration}
                        className="mt-2"
                        onChange={(e) => {
                          const newDuration = parseFloat(e.target.value) || 5
                          if (videoClip) {
                            setVideoClips((prev) =>
                              prev.map((c) =>
                                c.id === selectedClip ? { ...c, duration: newDuration } : c
                              )
                            )
                          } else if (audioClip) {
                            setAudioClips((prev) =>
                              prev.map((c) =>
                                c.id === selectedClip ? { ...c, duration: newDuration } : c
                              )
                            )
                          }
                        }}
                      />
                    </div>
                  </>
                )}

                        {caption && (
                          <>
                            <div>
                              <Label>Caption Text</Label>
                              <Input
                                value={caption.text}
                                className="mt-2"
                                onChange={(e) => {
                                  setCaptions((prev) =>
                                    prev.map((c) =>
                                      c.id === selectedClip ? { ...c, text: e.target.value } : c
                                    )
                                  )
                                }}
                              />
                            </div>

                            <div>
                              <Label>Font Size</Label>
                              <Input
                                type="number"
                                value={caption.style.fontSize}
                                className="mt-2"
                                onChange={(e) => {
                                  const newSize = parseInt(e.target.value) || 48
                                  setCaptions((prev) =>
                                    prev.map((c) =>
                                      c.id === selectedClip
                                        ? { ...c, style: { ...c.style, fontSize: newSize } }
                                        : c
                                    )
                                  )
                                }}
                              />
                            </div>

                            <div>
                              <Label>Duration (seconds)</Label>
                              <Input
                                type="number"
                                value={caption.duration}
                                className="mt-2"
                                onChange={(e) => {
                                  const newDuration = parseFloat(e.target.value) || 3
                                  setCaptions((prev) =>
                                    prev.map((c) =>
                                      c.id === selectedClip ? { ...c, duration: newDuration } : c
                                    )
                                  )
                                }}
                              />
                            </div>
                          </>
                        )}

                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            deleteClip(selectedClip)
                            setSelectedClip(null)
                          }}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete Clip
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* AI Chatbot Assistant */}
        <div className="px-4 lg:px-6 pb-4">
          <EditorChatbot
            onAction={(action, params) => {
              console.log("Chatbot action:", action, params)
              // Handle chatbot actions here
              // e.g., add caption, trim clip, export, etc.
            }}
          />
        </div>
        </div>
      </SidebarInset>

      {/* Export Progress Dialog */}
      <Dialog open={isExporting} onOpenChange={setIsExporting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporting Video</DialogTitle>
            <DialogDescription>
              Your video is being rendered and exported. This may take a few moments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{exportStage}</span>
                <span className="font-medium">{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Composition: {currentAspectRatio.width}×{currentAspectRatio.height}</p>
              <p>Duration: {formatTime(duration)}</p>
              <p>Clips: {videoClips.length} video, {audioClips.length} audio, {captions.length} captions</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
