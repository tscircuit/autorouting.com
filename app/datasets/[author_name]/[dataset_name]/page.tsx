import type { Dataset } from "@/api/lib/db/schema"
import { SampleThumbnail } from "@/components/SampleThumbnail"
import { Button } from "@/components/ui/button"
import { getBaseApiUrl, ky } from "@/lib/ky"
import { range } from "@/lib/utils/range"
import { timeAgo } from "@/lib/utils/time-ago"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useState } from "react"
import Markdown from "react-markdown"

export const dynamic = "force-dynamic"

interface DatasetPageProps {
  params: Promise<{
    author_name: string
    dataset_name: string
  }>
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  // TODO: Fetch dataset info and validate it exists
  const { author_name, dataset_name } = await params
  if (!author_name || !dataset_name) {
    notFound()
  }

  const { dataset } = await ky
    .get<{ dataset: Dataset }>("datasets/get", {
      searchParams: {
        dataset_name_with_owner: `${author_name}/${dataset_name}`,
      },
    })
    .json()

  return (
    <div className="container mx-auto py-6 px-4">
      <Link href="/datasets">
        <Button variant="ghost" className="text-xs pl-0 ml-0 opacity-50">
          <ArrowLeft className="w-4 h-4" />
          Datasets
        </Button>
      </Link>
      <h1 className="text-xl font-bold mb-2 flex items-center">
        {dataset.dataset_name_with_owner}
      </h1>
      <div className="flex items-center mb-4 text-xs text-gray-500">
        {dataset.sample_count} Samples
        <div className="bg-gray-300 rounded-xl w-1 h-1 ml-1 mr-1" />
        Updated{" "}
        {timeAgo.format(new Date(dataset.updated_at ?? dataset.created_at))}
        <div className="bg-gray-300 rounded-xl w-1 h-1 ml-1 mr-1" />v
        {dataset.version}
      </div>
      <div className="text-xs my-4">
        {dataset.description_md ? (
          <Markdown
            components={{
              a: ({ children, href }) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          >
            {dataset.description_md}
          </Markdown>
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
