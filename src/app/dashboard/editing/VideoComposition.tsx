import { AbsoluteFill, Audio, Img, Sequence, Video, useCurrentFrame, useVideoConfig } from "remotion"

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

interface VideoCompositionProps {
  mediaAssets: MediaAsset[]
  videoClips: TimelineClip[]
  audioClips: TimelineClip[]
  captions: Caption[]
  fps: number
  width: number
  height: number
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  mediaAssets,
  videoClips,
  audioClips,
  captions,
  fps,
  width,
  height,
}) => {
  const frame = useCurrentFrame()
  const currentTime = frame / fps

  // Sort clips by track number (ascending) so lower tracks render first (behind)
  const sortedVideoClips = [...videoClips].sort((a, b) => a.track - b.track)

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Render video/image clips - sorted by track for proper layering */}
      {sortedVideoClips.map((clip, index) => {
        const asset = mediaAssets.find((a) => a.id === clip.assetId)
        if (!asset) return null

        const startFrame = Math.floor(clip.startTime * fps)
        const durationInFrames = Math.floor(clip.duration * fps)

        // Calculate scale to fit clip dimensions within canvas
        const scaleX = clip.width / width
        const scaleY = clip.height / height

        return (
          <Sequence
            key={clip.id}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <div
              style={{
                position: "absolute",
                left: clip.x,
                top: clip.y,
                width: clip.width,
                height: clip.height,
                zIndex: clip.track,
                overflow: "hidden",
              }}
            >
              {asset.type === "video" ? (
                <Video
                  src={asset.url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  volume={clip.volume ? clip.volume / 100 : 1}
                />
              ) : asset.type === "image" ? (
                <Img
                  src={asset.url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : null}
            </div>
          </Sequence>
        )
      })}

      {/* Render audio clips */}
      {audioClips.map((clip) => {
        const asset = mediaAssets.find((a) => a.id === clip.assetId)
        if (!asset || asset.type !== "audio") return null

        const startFrame = Math.floor(clip.startTime * fps)
        const durationInFrames = Math.floor(clip.duration * fps)

        return (
          <Sequence
            key={clip.id}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <Audio src={asset.url} volume={clip.volume ? clip.volume / 100 : 1} />
          </Sequence>
        )
      })}

      {/* Render captions */}
      {captions.map((caption) => {
        const startFrame = Math.floor(caption.startTime * fps)
        const durationInFrames = Math.floor(caption.duration * fps)

        if (frame < startFrame || frame >= startFrame + durationInFrames) {
          return null
        }

        return (
          <div
            key={caption.id}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "8px 16px",
              fontSize: caption.style.fontSize,
              color: caption.style.color,
              backgroundColor: caption.style.backgroundColor,
              borderRadius: "4px",
              fontWeight: "bold",
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            {caption.text}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}
