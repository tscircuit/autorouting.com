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
  sampleRange: { start: number; end: number }
  onFinish: () => void
}

export function ContributeProcessingStep({
  selectedSnippet,
  sampleRange,
  onFinish,
}: ContributeProcessingStepProps) {
  const [samplesProcessed, setSamplesProcessed] = useState(0)

  useEffect(() => {}, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Processing Dataset</CardTitle>
        <CardDescription>
          Please wait while we process your dataset
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
      </CardContent>
    </Card>
  )
}
