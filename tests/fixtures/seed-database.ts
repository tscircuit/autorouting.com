import type { DbClient } from "@/api/lib/db/db-client"

export const seedDatabase = (db: DbClient) => {
  db.datasets.push({
    dataset_id: "dataset-1",
    dataset_name_with_owner: "testuser/custom-keyboards",
    dataset_name: "custom-keyboards",
    owner_name: "testuser",
    sample_count: 1,
    median_trace_count: 10,
    max_layer_count: 2,
    created_at: new Date().toISOString(),
  })
  db.datasets.push({
    dataset_id: "dataset-2",
    dataset_name_with_owner: "testuser/blinking-leds",
    dataset_name: "blinking-leds",
    owner_name: "testuser",
    sample_count: 3,
    median_trace_count: 5,
    max_layer_count: 1,
    created_at: new Date().toISOString(),
  })
}
