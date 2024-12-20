import { DatasetFilterSidebar } from "@/components/DatasetFilterSidebar"
import { DatasetMiniCard } from "@/components/DatasetMiniCard"
import { Input } from "@/components/ui/input"
import { Database, Star } from "lucide-react"
import { ky } from "@/lib/ky"
import type { Dataset } from "@/api/lib/db/schema"

export const dynamic = "force-dynamic"

export default async function DatasetsPage() {
  const { datasets } = await ky
    .get<{ datasets: Dataset[] }>("datasets/list")
    .json()

  return (
    <div className="flex">
      <DatasetFilterSidebar />
      <div className="flex flex-col flex-grow">
        <div className="p-4 flex items-center justify-center">
          <h1 className="text-md">
            Datasets <span className="text-gray-500">3</span>
          </h1>
          <div className="flex-grow" />
          <Input className="max-w-64" placeholder="Search datasets" />
        </div>
        <div className="px-2">
          {datasets.map((dataset) => (
            <DatasetMiniCard key={dataset.dataset_id} dataset={dataset} />
          ))}
        </div>
      </div>
    </div>
  )
}
