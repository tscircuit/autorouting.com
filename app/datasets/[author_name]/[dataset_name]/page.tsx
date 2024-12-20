import type { Dataset } from "@/api/lib/db/schema"
import { Button } from "@/components/ui/button"
import { ky } from "@/lib/ky"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

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
      {/* Dataset specific content will go here */}
    </div>
  )
}
