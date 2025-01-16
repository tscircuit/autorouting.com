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

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
}
