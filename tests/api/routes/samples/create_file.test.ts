import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("POST /samples/create_file should create a new sample file", async () => {
  const { ky } = await getTestServer()
  const res = await ky
    .post("samples/create_file", {
      json: {
        sample_id: "sample-1",
        file_path: "test.json",
        mimetype: "application/json",
        text_content: '{"test": true}',
      },
    })
    .json()

  expect(replaceTimestamps(res)).toMatchInlineSnapshot(`
{
  "sample_file": {
    "created_at": "[timestamp]",
    "file_path": "test.json",
    "mimetype": "application/json",
    "sample_file_id": "sample-file-13",
    "sample_id": "sample-1",
    "text_content": "{"test": true}",
  },
}
`)

  // Verify the file was actually added to the database
  const fileRes = await ky
    .get("samples/get_file", {
      searchParams: {
        sample_id: "sample-1",
        file_path: "test.json",
      },
    })
    .json()

  expect(fileRes.sample_file.text_content).toBe('{"test": true}')
})
