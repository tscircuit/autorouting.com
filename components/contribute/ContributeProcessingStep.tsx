"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import { SnippetDatasetUploader } from "@/lib/SnippetDatasetUploader"
import { useGlobalStore } from "@/hooks/use-global-store"
import type { Dataset } from "@/api/lib/db/schema"
import { useQueryClient } from "@tanstack/react-query"

interface ContributeProcessingStepProps {
  selectedSnippetName: string
  sampleRange: { start: number; end: number }
  onFinish: (params: { dataset: Dataset }) => void
}

export function ContributeProcessingStep({
  selectedSnippetName,
  sampleRange,
  onFinish,
}: ContributeProcessingStepProps) {
  const [samplesProcessed, setSamplesProcessed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  useEffect(() => {
    setError(null)
    const errors: string[] = []
    const processDataset = async () => {
      const uploader = new SnippetDatasetUploader({
        sessionToken: session?.token!,
        snippetName: selectedSnippetName,
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
        onFinish({
          dataset: uploader.dataset!,
        })
        await queryClient.invalidateQueries({
          queryKey: ["userDatasets"],
        })
      } catch (e: any) {
        errors.push(e.toString())
        setError(errors.join("\n"))
      }
    }

    processDataset()
  }, [])

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
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${samplesProcessed}%` }}
          ></div>
        </div>
        <div className="text-sm text-muted-foreground">
          Processing sample{" "}
          {Math.floor(
            (sampleRange.end - sampleRange.start) * (samplesProcessed / 100),
          )}{" "}
          of {sampleRange.end}
        </div>
        {error && (
          <div className="text-xs text-red-500 whitespace-pre-wrap">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
