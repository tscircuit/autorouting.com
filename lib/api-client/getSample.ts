"use server"
import { ky } from "@/lib/ky"
import type { Sample } from "@/api/lib/db/schema"

export async function getSample(dataset_id: string, sample_number: number) {
  const { sample } = await ky
    .get<{ sample: Sample }>(
      `samples/get?dataset_id=${dataset_id}&sample_number=${sample_number}`
    )
    .json()

  return sample
}
