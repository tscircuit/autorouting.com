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
import { useState } from "react"

interface Dataset {
  id: string
  name: string
  status: "Processing" | "Uploaded"
  version: number
  sample_count: number
}

export default function ContributePage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedSnippet, setSelectedSnippet] = useState("")
  const [sampleRange, setSampleRange] = useState({ start: "", end: "" })
  const [userDatasets, setUserDatasets] = useState<Dataset[]>([
    {
      id: "1",
      name: "Example Dataset",
      status: "Uploaded",
      sample_count: 100,
      version: 1,
    },
  ])

  const handleLogin = () => {
    setIsLoggedIn(true)
    setStep(2)
  }

  const handleSubmit = () => {
    // Handle submission logic here
  }

  const handleNewVersion = (datasetId: string) => {
    setUserDatasets((prev) =>
      prev.map((dataset) =>
        dataset.id === datasetId
          ? {
              ...dataset,
              version: dataset.version + 1,
              status: "Processing",
            }
          : dataset,
      ),
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl px-4">
      <h1 className="text-3xl font-bold mb-6">Contribute Dataset</h1>

      {/* Step 1: Login */}
      {step === 1 && !isLoggedIn && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Login</CardTitle>
            <CardDescription>
              Please login to contribute a dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogin}>
              Login with GitHub
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Dataset Configuration */}
      {step === 2 && isLoggedIn && (
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
                onValueChange={setSelectedSnippet}
              >
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
                    setSampleRange((prev) => ({
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
                    setSampleRange((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  placeholder="100"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              variant="outline"
              disabled={
                !selectedSnippet || !sampleRange.start || !sampleRange.end
              }
              className="w-full"
            >
              Submit Dataset
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User's Datasets */}
      {isLoggedIn && (
        <Card>
          <CardHeader>
            <CardTitle>Your Datasets</CardTitle>
            <CardDescription>
              View and manage your contributed datasets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userDatasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{dataset.name}</h3>
                    <p className="text-sm text-gray-500">
                      Version {dataset.version} • {dataset.status} •{" "}
                      {dataset.sample_count} samples
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleNewVersion(dataset.id)}
                    disabled={dataset.status === "Processing"}
                  >
                    Release New Version
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
