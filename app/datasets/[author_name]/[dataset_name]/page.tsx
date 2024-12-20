import type { Dataset } from "@/api/lib/db/schema"
import { SampleThumbnail } from "@/components/SampleThumbnail"
import { Button } from "@/components/ui/button"
import { getBaseApiUrl, ky } from "@/lib/ky"
import { range } from "@/lib/utils/range"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useState } from "react"
import Markdown from "react-markdown"

interface DatasetPageProps {
  params: {
    author_name: string
    dataset_name: string
  }
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  // TODO: Fetch dataset info and validate it exists
  if (!params.author_name || !params.dataset_name) {
    notFound()
  }

  const { dataset } = await ky
    .get<{ dataset: Dataset }>("datasets/get", {
      searchParams: {
        dataset_name_with_owner: `${params.author_name}/${params.dataset_name}`,
      },
    })
    .json()

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-xl font-bold mb-4 flex items-center">
        <Link href="/datasets">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Datasets
          </Button>
        </Link>
        {dataset.dataset_name_with_owner}
      </h1>
      <div className="text-xs my-4">
        <h2 className="text-lg font-bold mb-2">Description</h2>
        {dataset.description_md ? (
          <Markdown>{dataset.description_md}</Markdown>
        ) : (
          <span className="text-muted-foreground">No Description Provided</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Samples</h2>
        <div className="flex flex-wrap gap-2">
          {range(1, dataset.sample_count).map((i) => (
            <SampleThumbnail
              key={i}
              dataset_id={dataset.dataset_id}
              dataset_name_with_owner={dataset.dataset_name_with_owner}
              sample_number={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
