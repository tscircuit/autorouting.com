import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { Sample, SampleFile } from "@/api/lib/db/schema"
import { getBaseApiUrl, ky } from "@/lib/ky"
import { Download } from "lucide-react"

export const SampleDialog = ({
  sample,
  isOpen,
  dataset_name_with_owner,
  onClose,
}: {
  sample: Sample
  isOpen: boolean
  dataset_name_with_owner: string
  onClose: () => void
}) => {
  const sampleFilePaths = sample.available_file_paths ?? []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {dataset_name_with_owner} - Sample {sample?.sample_number}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Unrouted SVG</h3>
          <img
            src={`${getBaseApiUrl()}/samples/view_file?sample_id=${
              sample.sample_id
            }&file_path=unrouted_pcb.svg`}
            alt="PCB Svg"
          />
          <h3 className="font-semibold">Available Files</h3>
          <div className="grid grid-cols-2 gap-1">
            {sampleFilePaths.map((file_path) => (
              <Button
                key={file_path}
                variant="outline"
                className="justify-start"
                onClick={() => {
                  window.open(
                    `${getBaseApiUrl()}/samples/view_file?sample_id=${
                      sample.sample_id
                    }&file_path=${file_path}&download=true`,
                    "_blank",
                  )
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {file_path}
              </Button>
            ))}
          </div>
          <div className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
