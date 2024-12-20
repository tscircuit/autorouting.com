import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("GET /autorouters/list", async () => {
  const { ky } = await getTestServer()
  const res = await ky.get("autorouters/list").json()

  expect(replaceTimestamps(res)).toMatchInlineSnapshot(`
{
  "autorouters": [
    {
      "autorouter_id": "freerouting",
      "autorouter_name": "FreeRouting",
      "created_at": "[timestamp]",
      "description_md": "Java-based autorouter with push and shove routing capability",
      "github_url": "https://github.com/freerouting/freerouting",
      "license_type": "GPL",
      "version": "1.9.0",
      "website_url": "https://freerouting.org",
    },
    {
      "autorouter_id": "tscircuit-builtin",
      "autorouter_name": "TSCircuit Built-in Router",
      "created_at": "[timestamp]",
      "description_md": "Basic autorouter built into TSCircuit",
      "github_url": "https://github.com/tscircuit/tscircuit",
      "license_type": "MIT",
      "version": "0.1.0",
    },
  ],
}
`)
})
