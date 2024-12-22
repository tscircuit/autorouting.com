import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { datasetSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  jsonResponse: z.object({
    datasets: z.array(datasetSchema),
  }),
})((req, ctx) => {
  const datasets = ctx.db.getState().datasets

  return ctx.json({ datasets })
})
