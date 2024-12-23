"use client"

import type { Dataset } from "@/api/lib/db/schema"
import { Button } from "@/components/ui/button"
import { useDeleteDatasetDialog } from "@/components/dialogs/DeleteDatasetDialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useQuery } from "@tanstack/react-query"
import { Database } from "lucide-react"
import { ky } from "lib/ky"

interface YourDatasetsProps {
  onNewVersion: (datasetId: string) => void
}

export function YourDatasets({ onNewVersion }: YourDatasetsProps) {
  const { DialogComponent, openDialog } = useDeleteDatasetDialog()
  const session = useGlobalStore((s) => s.session)
  const datasetsQuery = useQuery({
    queryKey: ["userDatasets"],
    queryFn: async () => {
      return ky
        .get<{ datasets: Dataset[] }>("datasets/list_my_datasets", {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        })
        .json()
    },
    enabled: Boolean(session),
  })

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
          {datasetsQuery.data?.datasets.map((dataset) => (
            <div
              key={dataset.dataset_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{dataset.dataset_name}</h3>
                <p className="text-sm text-gray-500">
                  Version {dataset.version} • unknown status •{" "}
                  {dataset.sample_count} samples
                </p>
              </div>
              <div className="flex gap-2">
                {/* <Button
                  variant="outline"
                  onClick={() => onNewVersion(dataset.dataset_id)}
                  disabled={dataset.status === "Processing"}
                >
                  Regenerate
                </Button> */}
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-600 hover:bg-red-50"
                  onClick={() => openDialog()}
                >
                  Delete
                </Button>
                <DialogComponent dataset={dataset} />
              </div>
            </div>
          ))}
          {datasetsQuery.data?.datasets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
              <Database className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No datasets yet</p>
              <p className="text-sm">
                Your contributed datasets will appear here
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
