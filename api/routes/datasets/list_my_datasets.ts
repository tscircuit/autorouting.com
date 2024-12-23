import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { datasetSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  jsonResponse: z.object({
    datasets: z.array(datasetSchema),
  }),
})((req, ctx) => {
  const datasets = ctx.db
    .getState()
    .datasets.filter((d) => d.registry_account_id === ctx.auth.account_id)

  return ctx.json({ datasets })
})
