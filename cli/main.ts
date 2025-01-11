#!/usr/bin/env node

import { Command } from "commander"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { datasetDownloadCommand } from "./download/register"
import { datasetUploadCommand } from "./upload/register"

// You can expand this interface later
interface CliConfig {
  sessionToken: string | null;
}

const cliConfig: CliConfig = {
  sessionToken: null,
};

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const program = new Command()

program
  .name("autorouting")
  .description(
    "CLI tool for downloading datasets and running benchmarks for autorouting",
  )
  .version("0.0.1")

// Add commands here
datasetDownloadCommand(program)
datasetUploadCommand(program)

program.parse(process.argv)

export { cliConfig }
