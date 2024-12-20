import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("GET /autorouters/get", async () => {
  const { ky } = await getTestServer()
  const res = await ky
    .get("autorouters/get", {
      searchParams: {
        autorouter_id: "freerouting",
      },
    })
    .json()

  expect(replaceTimestamps(res)).toMatchInlineSnapshot(`
{
  "autorouter": {
    "autorouter_id": "freerouting",
    "autorouter_name": "FreeRouting",
    "created_at": "[timestamp]",
    "description_md": "Java-based autorouter with push and shove routing capability",
    "github_url": "https://github.com/freerouting/freerouting",
    "license_type": "GPL",
    "version": "1.9.0",
    "website_url": "https://freerouting.org",
  },
}
`)
})

it("GET /autorouters/get should return 404 for non-existent autorouter", async () => {
  const { ky } = await getTestServer()
  
  try {
    await ky
      .get("autorouters/get", {
        searchParams: {
          autorouter_id: "non-existent",
        },
      })
      .json()
    expect(false).toBe(true) // Should not reach here
  } catch (error: any) {
    expect(error.response.status).toBe(404)
    const errorData = await error.response.json()
    expect(errorData.error.error_code).toBe("autorouter_not_found")
  }
})
