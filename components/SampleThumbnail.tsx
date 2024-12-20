"use client"

import { getBaseApiUrl, ky } from "@/lib/ky"
import { SampleDialog } from "@/components/SampleDialog"
import { Fragment, useState } from "react"
import type { Sample } from "@/api/lib/db/schema"
import { getSample } from "@/lib/api-client/getSample"

export const SampleThumbnail = ({
  sample_number,
  dataset_id,
  dataset_name_with_owner,
}: {
  sample_number: number
  dataset_id: string
  dataset_name_with_owner: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [sample, setSample] = useState<Sample | null>(null)

  return (
    <Fragment>
      <div
        key={sample_number}
        className="border flex flex-col overflow-hidden hover:cursor-pointer hover:opacity-80 relative"
        onClick={async () => {
          setSample(await getSample(dataset_id, sample_number))
          setIsOpen(true)
        }}
      >
        <div className="text-xs left-2 top-1 absolute text-white">
          {sample_number}
        </div>
        <img
          key={sample_number}
          width={200}
          height={200}
          src={`${getBaseApiUrl()}/samples/view_file?dataset_id=${dataset_id}&sample_number=${sample_number}&file_path=unrouted_pcb.svg`}
          alt={`Sample ${sample_number}`}
        />
      </div>
      {isOpen && (
        <SampleDialog
          sample={sample!}
          dataset_name_with_owner={dataset_name_with_owner}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </Fragment>
  )
}
