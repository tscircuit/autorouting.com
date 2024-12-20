import type { DbClient } from "@/api/lib/db/db-client"

export const seedDatabase = (db: DbClient) => {
  // Seed datasets
  db.datasets.push({
    dataset_id: "dataset-1",
    dataset_name_with_owner: "testuser/custom-keyboards",
    dataset_name: "custom-keyboards",
    owner_name: "testuser",
    sample_count: 1,
    median_trace_count: 10,
    max_layer_count: 2,
    created_at: new Date().toISOString(),
    star_count: 0,
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
    star_count: 0,
  })

  // Seed autorouters
  db.autorouters.push({
    autorouter_id: "freerouting",
    autorouter_name: "FreeRouting",
    version: "1.9.0",
    description_md: "Java-based autorouter with push and shove routing capability",
    github_url: "https://github.com/freerouting/freerouting",
    website_url: "https://freerouting.org",
    license_type: "GPL",
    created_at: new Date().toISOString(),
  })

  db.autorouters.push({
    autorouter_id: "tscircuit-builtin", 
    autorouter_name: "TSCircuit Built-in Router",
    version: "0.1.0",
    description_md: "Basic autorouter built into TSCircuit",
    github_url: "https://github.com/tscircuit/tscircuit",
    license_type: "MIT",
    created_at: new Date().toISOString(),
  })
}
