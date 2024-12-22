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
import type { Dataset } from "@/api/lib/db/schema"

export const dynamic = "force-dynamic"

export default function ContributePage() {
  const isLoggedIn = useGlobalStore((s) => !!s.session)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedSnippet, setSelectedSnippet] = useState<{
    snippet_id: string
    name: string
  } | null>(null)
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const [sampleRange, setSampleRange] = useState({ start: 1, end: 2 })
  const [userDatasets, setUserDatasets] = useState<Dataset[]>([
    {
      dataset_name: "Example Dataset",
      dataset_id: "example-dataset-1",
      dataset_name_with_owner: "johndoe/example-dataset",
      owner_name: "johndoe",
      sample_count: 100,
      version: "1.0.0",
      median_trace_count: 25,
      max_layer_count: 5,
      star_count: 12,
      created_at: new Date().toISOString(),
    },
  ])

  const [newDataset, setNewDataset] = useState<Dataset | null>(null)

  useEffect(() => {
    if (isLoggedIn && step === 1) {
      setStep(2)
    }
  }, [isLoggedIn, step])

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
          onSubmit={() => {
            setStep(3)
          }}
        />
      )}

      {step === 3 && (
        <ContributeProcessingStep
          selectedSnippetName={selectedSnippet?.name!}
          sampleRange={sampleRange}
          onFinish={({ dataset }) => {
            setNewDataset(dataset)
            setStep(4)
          }}
        />
      )}

      {step === 4 && (
        <ContributeSuccessStep
          dataset={newDataset!}
          onReset={() => {
            setStep(2)
          }}
        />
      )}

      {isLoggedIn && (
        <YourDatasets datasets={userDatasets} onNewVersion={() => {}} />
      )}
    </div>
  )
}
