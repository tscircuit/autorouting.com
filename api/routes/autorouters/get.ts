import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { autorouterSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  commonParams: z.object({
    autorouter_id: z.string(),
  }),
  jsonResponse: z.object({
    autorouter: autorouterSchema,
  }),
})((req, ctx) => {
  const { autorouter_id } = req.commonParams

  const autorouter = ctx.db
    .getState()
    .autorouters.find((a) => a.autorouter_id === autorouter_id)

  if (!autorouter) {
    return ctx.error(404, {
      error_code: "autorouter_not_found",
      message: `Autorouter not found: ${autorouter_id}`,
    })
  }

  return ctx.json({ autorouter })
})
