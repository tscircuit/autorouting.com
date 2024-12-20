"use client"

import { Input } from "@/components/ui/input"
import { AutorouterMiniCard } from "@/components/AutorouterMiniCard"

export default function AutoroutersPage() {
  return (
    <div className="flex">
      <div className="flex flex-col flex-grow">
        <div className="p-4 flex items-center justify-center">
          <h1 className="text-md">
            Autorouters <span className="text-gray-500">2</span>
          </h1>
          <div className="flex-grow" />
          <Input className="max-w-64" placeholder="Search autorouters" />
        </div>
        <div className="px-2">
          <AutorouterMiniCard />
        </div>
      </div>
    </div>
  )
}
