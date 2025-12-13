import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Convert File to format OpenAI expects
    const buffer = await file.arrayBuffer()
    const blob = new Blob([buffer], { type: file.type })

    // Create a File object that OpenAI API can handle
    const audioFile = new File([blob], file.name, { type: file.type })

    // Transcribe with timestamps for pause detection
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
    })

    // Detect pauses by analyzing gaps between words
    const pauses = detectPauses(transcription)

    return NextResponse.json({
      transcription: transcription.text,
      segments: transcription.segments || [],
      words: transcription.words || [],
      pauses,
      duration: transcription.duration,
    })
  } catch (error: any) {
    console.error("Whisper transcription error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to transcribe audio" },
      { status: 500 }
    )
  }
}

interface Word {
  word: string
  start: number
  end: number
}

interface Pause {
  start: number
  end: number
  duration: number
  type: "short" | "awkward" | "long"
}

function detectPauses(transcription: any): Pause[] {
  const pauses: Pause[] = []
  const words: Word[] = transcription.words || []

  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i]
    const nextWord = words[i + 1]

    if (currentWord.end && nextWord.start) {
      const gap = nextWord.start - currentWord.end

      // Classify pauses
      // Short pause: 0.5-1s (normal)
      // Awkward pause: 1-2.5s (potentially needs editing)
      // Long pause: 2.5s+ (definitely needs attention)

      if (gap >= 0.5) {
        let type: "short" | "awkward" | "long" = "short"

        if (gap >= 2.5) {
          type = "long"
        } else if (gap >= 1.0) {
          type = "awkward"
        }

        pauses.push({
          start: currentWord.end,
          end: nextWord.start,
          duration: gap,
          type,
        })
      }
    }
  }

  return pauses
}
