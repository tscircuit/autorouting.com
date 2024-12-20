import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CircuitBoard, Star } from "lucide-react"

export function AutorouterMiniCard() {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-start gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">Neural Autorouter v1</h3>
            <Badge variant="outline" className="text-xs">
              Neural Network
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            A deep learning based autorouter trained on professional PCB designs
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CircuitBoard className="w-4 h-4" />
            <span>98% completion rate</span>
            <Star className="w-4 h-4 ml-2" />
            <span>4.5/5 rating</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
