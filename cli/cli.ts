#!/usr/bin/env node

import { Command } from "commander"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

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

program.parse(process.argv)
