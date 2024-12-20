import { DbClient } from "@/api/lib/db/db-client"
export const seedDatabase = (db: DbClient) => {
  db.datasets.push({
    dataset_id: "dataset-1",
    dataset_name_with_owner: "testuser/custom-keyboards",
    dataset_name: "custom-keyboards",
    owner_name: "testuser",
    sample_count: 1,
    median_trace_count: 10,
    max_layer_count: 10,
    created_at: new Date().toISOString(),
  })
}
