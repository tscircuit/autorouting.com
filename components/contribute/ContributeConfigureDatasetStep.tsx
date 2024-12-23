"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

interface ContributeConfigureDatasetStepProps {
  selectedSnippet: string
  setSelectedSnippet: (value: string) => void
  sampleRange: { start: string; end: string }
  setSampleRange: (value: { start: string; end: string }) => void
  onSubmit: () => void
}

export function ContributeConfigureDatasetStep({
  selectedSnippet,
  setSelectedSnippet,
  sampleRange,
  setSampleRange,
  onSubmit,
}: ContributeConfigureDatasetStepProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Step 2: Configure Dataset</CardTitle>
        <CardDescription>
          Select a snippet from your{" "}
          <Link href="https://tscircuit.com">tscircuit snippets</Link> and
          define the sample range
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Snippet</label>
          <Select value={selectedSnippet} onValueChange={setSelectedSnippet}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a snippet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="snippet1">Snippet 1</SelectItem>
              <SelectItem value="snippet2">Snippet 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Sample</label>
            <Input
              type="number"
              value={sampleRange.start}
              onChange={(e) =>
                setSampleRange({
                  ...sampleRange,
                  start: e.target.value,
                })
              }
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Sample</label>
            <Input
              type="number"
              value={sampleRange.end}
              onChange={(e) =>
                setSampleRange({
                  ...sampleRange,
                  end: e.target.value,
                })
              }
              placeholder="100"
            />
          </div>
        </div>

        <Button
          onClick={onSubmit}
          variant="outline"
          disabled={!selectedSnippet || !sampleRange.start || !sampleRange.end}
          className="w-full"
        >
          Submit Dataset
        </Button>
      </CardContent>
    </Card>
  )
}
