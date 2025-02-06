import { convertCircuitJsonToDsnString } from "dsn-converter"
import type { AnyCircuitElement } from "circuit-json"
import { writeFile } from "fs/promises"
import { temporaryFile as tempyFile } from "tempy"

export async function convertAndSaveCircuitToDsn(
  circuit: AnyCircuitElement[],
): Promise<string> {
  // Convert circuit JSON to DSN format
  const dsnContent = convertCircuitJsonToDsnString(circuit)

  // Create temporary file with .dsn extension
  const tempPath = tempyFile({ extension: "dsn" })

  // Write DSN file to temp location
  await writeFile(tempPath, dsnContent).catch((err) => {
    throw new Error(
      `Failed to write DSN file to "${tempPath}". Original error: ${err.message}`,
    )
  })

  return tempPath
}
