"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Dataset {
  id: string
  name: string
  status: "Processing" | "Uploaded"
  version: number
  sample_count: number
}

interface YourDatasetsProps {
  datasets: Dataset[]
  onNewVersion: (datasetId: string) => void
}

export function YourDatasets({ datasets, onNewVersion }: YourDatasetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Datasets</CardTitle>
        <CardDescription>
          View and manage your contributed datasets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{dataset.name}</h3>
                <p className="text-sm text-gray-500">
                  Version {dataset.version} • {dataset.status} •{" "}
                  {dataset.sample_count} samples
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => onNewVersion(dataset.id)}
                disabled={dataset.status === "Processing"}
              >
                Release New Version
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
