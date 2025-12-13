"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  UploadIcon,
  FileAudioIcon,
  AlertCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Pause {
  start: number
  end: number
  duration: number
  type: "short" | "awkward" | "long"
}

interface TranscriptionResult {
  transcription: string
  segments: any[]
  words: any[]
  pauses: Pause[]
  duration: number
}

interface TranscriptionPanelProps {
  onTranscriptionComplete?: (result: TranscriptionResult) => void
  onPauseClick?: (pause: Pause) => void
}

export function TranscriptionPanel({
  onTranscriptionComplete,
  onPauseClick,
}: TranscriptionPanelProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<TranscriptionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsTranscribing(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch("/api/whisper/transcribe", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Transcription failed")
      }

      const data: TranscriptionResult = await response.json()
      setResult(data)

      if (onTranscriptionComplete) {
        onTranscriptionComplete(data)
      }
    } catch (err: any) {
      setError(err.message || "Failed to transcribe audio")
      console.error("Transcription error:", err)
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPauseColor = (type: string) => {
    switch (type) {
      case "short":
        return "bg-blue-500/20 border-blue-500 text-blue-700"
      case "awkward":
        return "bg-yellow-500/20 border-yellow-500 text-yellow-700"
      case "long":
        return "bg-red-500/20 border-red-500 text-red-700"
      default:
        return "bg-gray-500/20 border-gray-500 text-gray-700"
    }
  }

  const getPauseIcon = (type: string) => {
    switch (type) {
      case "short":
        return <ClockIcon className="h-3 w-3" />
      case "awkward":
        return <AlertCircleIcon className="h-3 w-3" />
      case "long":
        return <XCircleIcon className="h-3 w-3" />
      default:
        return <ClockIcon className="h-3 w-3" />
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Audio Transcription</h3>
          <p className="text-xs text-muted-foreground">
            Upload audio to detect awkward pauses and get a transcript
          </p>
        </div>

        {/* Upload Section */}
        {!result && (
          <div>
            <Label htmlFor="audio-upload" className="cursor-pointer">
              <div
                className={cn(
                  "flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition-colors",
                  isTranscribing
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary hover:bg-accent"
                )}
              >
                <FileAudioIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isTranscribing ? "Transcribing..." : "Click to upload audio"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP3, WAV, M4A, or video files
                </p>
              </div>
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isTranscribing}
              />
            </Label>

            {isTranscribing && (
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {progress}% - Processing audio...
                </p>
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Transcription Complete</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setResult(null)
                  setError(null)
                }}
              >
                Upload New
              </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold">
                  {formatTime(result.duration)}
                </p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Pauses Found</p>
                <p className="text-sm font-semibold">{result.pauses.length}</p>
              </div>
            </div>

            {/* Transcript */}
            <div>
              <Label className="text-xs mb-1">Transcript</Label>
              <div className="p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                <p className="text-sm">{result.transcription}</p>
              </div>
            </div>

            {/* Pauses List */}
            {result.pauses.length > 0 && (
              <div>
                <Label className="text-xs mb-2">Detected Pauses</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.pauses.map((pause, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-2 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity",
                        getPauseColor(pause.type)
                      )}
                      onClick={() => onPauseClick?.(pause)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPauseIcon(pause.type)}
                          <span className="text-xs font-medium capitalize">
                            {pause.type} Pause
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {pause.duration.toFixed(2)}s
                        </Badge>
                      </div>
                      <p className="text-xs mt-1 opacity-75">
                        At {formatTime(pause.start)} - {formatTime(pause.end)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
