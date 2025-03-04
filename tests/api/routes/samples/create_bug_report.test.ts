import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"

// Basic test to verify the endpoint works
it("POST /samples/create_bug_report should create a new sample with route data", async () => {
  const { testUserKy } = await getTestServer()

  // Make the request
  const res = await testUserKy
    .post("samples/create_bug_report", {
      json: {
        sample_name: "Test Bug Report",
        simple_route_json: { test: "data" },
      },
    })
    .json()

  // Replace sample_id with a consistent value for snapshot matching
  const normalizedRes = JSON.parse(
    JSON.stringify(res).replace(
      /sample_id=sample-\d+/,
      "sample_id=[sample-id]",
    ),
  )

  // Use snapshot for consistency with other tests
  expect(replaceTimestamps(normalizedRes)).toMatchInlineSnapshot(`
    {
      "bug_report": {
        "sample_url": "http://localhost:3091/samples/view_file?sample_id=[sample-id]&file_path=route.json",
      },
    }
  `)

  // Verify the bug report dataset exists for the test user
  const datasetsRes: any = await testUserKy.get("datasets/list").json()
  const bugReportsDataset = datasetsRes.datasets.find(
    (d: any) => d.dataset_name === "bug-reports" && d.owner_name === "testuser",
  )

  expect(bugReportsDataset).toBeTruthy()
  expect(bugReportsDataset.sample_count).toBeGreaterThan(0)

  // Verify sample file was created with the route.json
  const sampleId = (res as any).bug_report.sample_url.match(
    /sample_id=([^&]+)/,
  )[1]
  const fileRes: any = await testUserKy
    .get("samples/get_file", {
      searchParams: {
        sample_id: sampleId,
        file_path: "route.json",
      },
    })
    .json()

  expect(fileRes.sample_file.mimetype).toBe("application/json")
  expect(JSON.parse(fileRes.sample_file.text_content)).toEqual({ test: "data" })
})
