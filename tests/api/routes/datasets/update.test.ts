import type { Dataset } from "@/api/lib/db/schema"
import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("POST /datasets/update should update dataset processing status", async () => {
  const { testUserKy } = await getTestServer()

  // First verify the dataset exists and is processing
  const initialRes = await testUserKy
    .get<{ dataset: Dataset }>("datasets/get", {
      searchParams: {
        dataset_id: "dataset-1",
      },
    })
    .json()
  expect(initialRes.dataset.is_processing).toBeFalsy()

  // Update the processing status
  const updateRes = await testUserKy
    .post("datasets/update", {
      json: {
        dataset_id: "dataset-1",
        is_processing: true,
      },
    })
    .json()

  // Verify the change was persisted
  const finalRes = await testUserKy
    .get<{ dataset: Dataset }>("datasets/get", {
      searchParams: {
        dataset_id: "dataset-1",
      },
    })
    .json()
  expect(finalRes.dataset.is_processing).toBe(true)
})

// it("POST /datasets/update should return 401 for non-existent dataset", async () => {
//   const { testUserKy } = await getTestServer()

//   try {
//     await testUserKy
//       .post("datasets/update", {
//         json: {
//           dataset_id: "non-existent",
//           is_processing: false,
//         },
//       })
//       .json()
//     expect(false).toBe(true) // Should not reach here
//   } catch (error: any) {
//     expect(error.response.status).toBe(401)
//     const errorData = await error.response.json()
//     expect(errorData.error.error_code).toBe("no_token")
//   }
// })
