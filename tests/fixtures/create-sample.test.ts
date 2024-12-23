import { test, expect } from "bun:test"
import { createSample } from "../../lib/dataset/create-sample"

test("create keyboard sample", async () => {
  const { circuitJson, dsnString, pcbSvg, simpleRouteJson } =
    await createSample("keyboard", 1)

  expect(circuitJson).toBeDefined()
  expect(dsnString).toBeDefined()
  expect(pcbSvg).toBeDefined()
  expect(simpleRouteJson).toBeDefined()
})
