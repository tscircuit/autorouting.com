"use client"

import { useState } from "react"
import { ContributeLoginStep } from "@/components/contribute/ContributeLoginStep"
import { ContributeConfigureDatasetStep } from "@/components/contribute/ContributeConfigureDatasetStep"
import { YourDatasets } from "@/components/contribute/YourDatasets"

export const dynamic = "force-dynamic"

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

      {step === 1 && !isLoggedIn && <ContributeLoginStep onLogin={handleLogin} />}

      {step === 2 && isLoggedIn && (
        <ContributeConfigureDatasetStep
          selectedSnippet={selectedSnippet}
          setSelectedSnippet={setSelectedSnippet}
          sampleRange={sampleRange}
          setSampleRange={setSampleRange}
          onSubmit={handleSubmit}
        />
      )}

      {isLoggedIn && (
        <YourDatasets datasets={userDatasets} onNewVersion={handleNewVersion} />
      )}
    </div>
  )
}
