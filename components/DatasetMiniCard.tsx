import { Database, Star } from "lucide-react"

export const DatasetMiniCard = () => {
  return (
    <div className="p-2 flex flex-col border border-b-gray-200 m-2 rounded-md hover:cursor-pointer hover:bg-gray-100">
      <div className="flex items-center">
        <Database className="w-4 h-4 mr-1 text-gray-500" />
        <div className="text-sm text-gray-700">seveibar/keyboard</div>
      </div>
      <div className="flex text-xs mt-1 items-center">
        <div className="text-gray-500">1,000+ Samples</div>
        <div className="bg-gray-300 rounded-xl w-1 h-1 ml-1 mr-1" />
        <div className="text-gray-500">Updated 10 days ago</div>
        <div className="bg-gray-300 rounded-xl w-1 h-1 ml-1 mr-1" />
        <div className="text-gray-500 flex items-center">
          <Star className="w-2 h-2 mr-0.5" />5
        </div>
      </div>
    </div>
  )
}
