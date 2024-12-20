import type { DbClient } from "@/api/lib/db/db-client"
import { createSample } from "./create-sample"
import databaseSeedJson from "./seed-database.generated.json"

export const seedDatabase = async (db: DbClient) => {
  const copiedSeed = JSON.parse(JSON.stringify(databaseSeedJson))
  db.datasets.push(...copiedSeed.datasets)
  db.samples.push(...copiedSeed.samples)
  db.sample_files.push(...copiedSeed.sample_files)
  db.autorouters.push(...copiedSeed.autorouters)
  db.autorouter_run_results.push(...copiedSeed.autorouter_run_results)
}
