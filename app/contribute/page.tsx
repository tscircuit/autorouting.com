"use client"

import { useEffect, useState } from "react"
import { ContributeLoginStep } from "@/components/contribute/ContributeLoginStep"
import { ContributeConfigureDatasetStep } from "@/components/contribute/ContributeConfigureDatasetStep"
import { YourDatasets } from "@/components/contribute/YourDatasets"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useQuery } from "@tanstack/react-query"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { ContributeProcessingStep } from "@/components/contribute/ContributeProcessingStep"
import { ContributeSuccessStep } from "@/components/contribute/ContributeSuccessStep"

export const dynamic = "force-dynamic"

interface Dataset {
  id: string
  name: string
  status: "Processing" | "Uploaded"
  version: number
  sample_count: number
}

export default function ContributePage() {
  const isLoggedIn = useGlobalStore((s) => !!s.session)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedSnippet, setSelectedSnippet] = useState("")
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
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

  useEffect(() => {
    if (isLoggedIn && step === 1) {
      setStep(2)
    }
  }, [isLoggedIn, step])

  const handleSubmit = () => {
    // Handle submission logic here
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl flex flex-col space-y-4 px-4">
      <h1 className="text-3xl font-bold mb-2">Contribute Dataset</h1>

      {step === 1 && <ContributeLoginStep />}

      {step === 2 && (
        <ContributeConfigureDatasetStep
          selectedSnippet={selectedSnippet}
          onChangeSelectedSnippet={setSelectedSnippet}
          sampleRange={sampleRange}
          onChangeSampleRange={setSampleRange}
          onSubmit={handleSubmit}
        />
      )}

      {step === 3 && (
        <ContributeProcessingStep
          selectedSnippet={selectedSnippet}
          sampleRange={sampleRange}
          onFinish={() => {
            setStep(4)
          }}
        />
      )}

      {step === 4 && <ContributeSuccessStep />}

      {isLoggedIn && (
        <YourDatasets datasets={userDatasets} onNewVersion={() => {}} />
      )}
    </div>
  )
}
