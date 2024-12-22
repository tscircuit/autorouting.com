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
import {} from "@/components/ui/
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

interface ContributeConfigureDatasetStepProps {
  selectedSnippet: string
  onChangeSelectedSnippet: (value: string) => void
  sampleRange: { start: string; end: string }
  onChangeSampleRange: (value: { start: string; end: string }) => void
  onSubmit: () => void
}

export function ContributeConfigureDatasetStep({
  selectedSnippet,
  onChangeSelectedSnippet,
  sampleRange,
  onChangeSampleRange,
  onSubmit,
}: ContributeConfigureDatasetStepProps) {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const session = useGlobalStore((s) => s.session)

  const mySnippets = useQuery({
    queryKey: ["my-snippets"],
    queryFn: () =>
      fetch(
        `${snippetsBaseApiUrl}/snippets/list?owner_name=${session?.github_username}`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        },
      )
        .then((res) => res.json())
        .then(
          (a) =>
            a.snippets as Array<{
              snippet_id: string
              unscoped_name: string
              owner_name: string
              name: string
            }>,
        ),
  })

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
          <Select
            value={selectedSnippet}
            onValueChange={onChangeSelectedSnippet}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a snippet" />
            </SelectTrigger>
            <SelectContent>
              {mySnippets.data?.map((snippet) => (
                <SelectItem key={snippet.snippet_id} value={snippet.snippet_id}>
                  {snippet.name}
                </SelectItem>
              ))}
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
                onChangeSampleRange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
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
                onChangeSampleRange((prev) => ({
                  ...prev,
                  end: e.target.value,
                }))
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
