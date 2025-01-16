#!/usr/bin/env node

import { Command } from "commander"
import { fileURLToPath } from "node:url"
// import { cliConfig } from "./config"
import { dirname } from "node:path"
import { datasetDownloadCommand } from "./download/register"
import { autorouterRunCommand } from "./run/register"
import { registerUploadDatasetCommand } from "./upload/register"

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
autorouterRunCommand(program)
registerUploadDatasetCommand(program)

program.parse(process.argv)

// export { cliConfig }
