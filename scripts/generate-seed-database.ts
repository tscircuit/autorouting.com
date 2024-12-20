import type { DatabaseSchema } from "@/api/lib/db/schema"
import { createSample } from "@/tests/fixtures/create-sample"
import { writeFileSync } from "node:fs"

export const generateSeedDatabase = async (): Promise<DatabaseSchema> => {
  const db: DatabaseSchema = {
    id_counter: 0,
    datasets: [],
    samples: [],
    sample_files: [],
    autorouters: [],
    autorouter_run_results: [],
  }
  // Seed datasets
  db.datasets.push({
    dataset_id: "dataset-1",
    dataset_name_with_owner: "testuser/custom-keyboards",
    dataset_name: "custom-keyboards",
    owner_name: "testuser",
    sample_count: 3,
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
    description_md:
      "Java-based autorouter with push and shove routing capability",
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

  for (let i = 0; i < 3; i++) {
    const { circuitJson, dsnString, pcbSvg, simpleRouteJson } =
      await createSample("keyboard", i + 1)
    db.samples.push({
      sample_id: `sample-${i + 1}`,
      dataset_id: "dataset-1",
      sample_number: i + 1,
      created_at: new Date().toISOString(),
    })

    const filesToInsert = {
      "circuit.json": circuitJson,
      "unsolved_routes.dsn": dsnString,
      "pcb.svg": pcbSvg,
      "simple_route.json": simpleRouteJson,
    }

    for (const [filename, content] of Object.entries(filesToInsert)) {
      db.sample_files.push({
        sample_file_id: `sample-${i + 1}-${filename}`,
        sample_id: `sample-${i + 1}`,
        file_path: filename,
        mimetype: getMimetypeFromFileName(filename),
        text_content:
          typeof content === "string" ? content : JSON.stringify(content),
        created_at: new Date().toISOString(),
      })
    }
  }
  return db
}

function getMimetypeFromFileName(filename: string): string {
  if (filename.endsWith(".json")) {
    return "application/json"
  }
  if (filename.endsWith(".svg")) {
    return "image/svg+xml"
  }
  if (filename.endsWith(".dsn")) {
    return "text/plain"
  }
  throw new Error(`Unknown file type: ${filename}`)
}

const db = await generateSeedDatabase()

writeFileSync(
  "tests/fixtures/seed-database.generated.json",
  JSON.stringify(db, null, 2)
)
