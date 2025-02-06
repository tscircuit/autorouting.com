import { writeFile } from "fs/promises"
import { join } from "path/posix"

export async function createPackageJson(
  outputPath: string,
  { author, datasetName }: { author: string; datasetName: string },
) {
  const packageJsonPath = join(outputPath, "package.json")

  const packageJson = {
    name: `@autorouting/${author}.${datasetName}`,
  }

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2)).catch(
    (err) => {
      throw new Error(
        `Failed to write package.json to "${packageJsonPath}". Original error: ${err.message}`,
      )
    },
  )
}
