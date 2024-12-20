"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CircuitBoard, Scale, Star } from "lucide-react"
import type { Autorouter } from "@/api/lib/db/schema.js"
import Markdown from "react-markdown"

export function AutorouterMiniCard({ autorouter }: { autorouter: Autorouter }) {
  return (
    <Card className="p-4 mb-4 rounded-md hover:cursor-pointer hover:bg-gray-100">
      <div className="flex items-start gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{autorouter.autorouter_name}</h3>
            {autorouter.version && (
              <Badge variant="outline" className="text-xs">
                {autorouter.version}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            <Markdown>{autorouter.description_md}</Markdown>
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CircuitBoard className="w-4 h-4" />
            <span>??% Overall Completion</span>
            <Star className="w-4 h-4 ml-2" />
            <span>0</span>
            <Scale className="w-4 h-4 ml-2" />
            <span>{autorouter.license_type}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
