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

interface ContributeProcessingStepProps {
  selectedSnippet: string
  sampleRange: { start: string; end: string }
  onFinish: () => void
}

export function ContributeProcessingStep({
  selectedSnippet,
  sampleRange,
  onFinish,
}: ContributeProcessingStepProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate processing progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          onFinish()
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => clearInterval(interval)
  }, [onFinish])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Processing Dataset</CardTitle>
        <CardDescription>
          Please wait while we process your dataset
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="text-sm text-muted-foreground">
          Processing sample {Math.floor((parseInt(sampleRange.end) - parseInt(sampleRange.start)) * (progress / 100))} of{" "}
          {parseInt(sampleRange.end) - parseInt(sampleRange.start)}
        </div>
      </CardContent>
    </Card>
  )
}
