import { Database, Star } from "lucide-react"
import type { Dataset } from "@/api/lib/db/schema"
import { timeAgo } from "@/lib/utils/time-ago"
import Link from "next/link"

export const DatasetMiniCard = ({ dataset }: { dataset: Dataset }) => {
  return (
    <Link
      href={`/datasets/${dataset.dataset_name_with_owner}`}
      className="p-2 flex flex-col border border-b-gray-200 m-2 rounded-md hover:cursor-pointer hover:bg-gray-100"
    >
      <div className="flex items-center">
        <Database className="w-4 h-4 mr-1 text-gray-500" />
        <div className="text-sm text-gray-700">
          {dataset.dataset_name_with_owner}
        </div>
      </div>
      <div className="flex text-xs mt-1 items-center">
        <div className="text-gray-500">{dataset.sample_count} Samples</div>
        <div className="bg-gray-300 rounded-xl w-1 h-1 ml-1 mr-1" />
        <div className="text-gray-500">
          Updated{" "}
          {timeAgo.format(new Date(dataset.updated_at ?? dataset.created_at))}
        </div>
        {/* <div className="bg-gray-300 rounded-xl w-1 h-1 ml-1 mr-1" />
        <div className="text-gray-500 flex items-center">
          <Star className="w-2 h-2 mr-0.5" />5
        </div> */}
      </div>
    </Link>
  )
}
