"use client"

import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { SnippetDatasetUploader } from "@/lib/SnippetDatasetUploader"
import { useGlobalStore } from "@/hooks/use-global-store"

interface ContributeProcessingStepProps {
  selectedSnippetName: string
  sampleRange: { start: number; end: number }
  onFinish: () => void
}

export function ContributeProcessingStep({
  selectedSnippetName,
  sampleRange,
  onFinish,
}: ContributeProcessingStepProps) {
  const [samplesProcessed, setSamplesProcessed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const session = useGlobalStore((s) => s.session)

  useEffect(() => {
    let errors: string[] = []
    const processDataset = async () => {
      const uploader = new SnippetDatasetUploader({
        sessionToken: session?.token!,
        snippetName: `@tsci/${selectedSnippetName.replace("/", ".")}`,
        sampleRange: {
          start: sampleRange.start,
          end: sampleRange.end,
        },
      })

      uploader.on("sample:finished", (e) => {
        const progress =
          ((e.sampleNumber - sampleRange.start + 1) /
            (sampleRange.end - sampleRange.start + 1)) *
          100
        setSamplesProcessed(progress)
      })

      uploader.on("sample:error", async (e) => {
        console.error(`Error processing sample ${e.sampleNumber}:`, e.error)
        let errorMessage = `Error processing sample ${e.sampleNumber}: `
        if (e.error.response) {
          // Try to get the response payload for more details
          try {
            const payload = await e.error.response.json()
            errorMessage += JSON.stringify(payload, null, 2)
          } catch {
            errorMessage += e.error.toString()
          }
        } else {
          errorMessage += e.error.toString()
        }
        errors.push(errorMessage)
        setError(errors.join("\n"))
      })

      try {
        await uploader.run()
        onFinish()
      } catch (e: any) {
        errors.push(e.toString())
        setError(errors.join("\n"))
      }
    }

    processDataset()
  }, [selectedSnippetName, sampleRange, onFinish])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Processing Dataset</CardTitle>
        <CardDescription>
          Please wait while we process your dataset
          <br />
          Generating samples {sampleRange.start} to {sampleRange.end} for
          snippet "{selectedSnippetName}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={samplesProcessed} className="w-full" />
        <div className="text-sm text-muted-foreground">
          Processing sample{" "}
          {Math.floor(
            (sampleRange.end - sampleRange.start) * (samplesProcessed / 100),
          )}{" "}
          of {sampleRange.end - sampleRange.start}
        </div>
        {error && (
          <div className="text-sm text-red-500 whitespace-pre">{error}</div>
        )}
      </CardContent>
    </Card>
  )
}
