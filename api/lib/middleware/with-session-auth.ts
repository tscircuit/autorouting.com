import type { Middleware } from "winterspec/middleware"
import * as jose from "jose"

export const withSessionAuth: Middleware<
  {
    error: (
      status: number,
      body: { error_code: string; message: string },
    ) => Response
  },
  {
    auth: {
      type: "session"
      github_username: string
      account_id: string
      session_id: string
    }
  },
  {}
> = async (req, ctx, next) => {
  if (req.method === "OPTIONS") return next(req, ctx)

  const token = req.headers.get("authorization")?.split("Bearer ")?.[1]

  if (!token) {
    return ctx.error(401, {
      error_code: "no_token",
      message: "No token provided",
    })
  }

  const decoded_token = jose.decodeJwt(token)

  if (decoded_token instanceof Error) {
    return ctx.error(401, {
      error_code: "invalid_token",
      message: "Token could not be verified",
    })
  }

  ctx.auth = {
    type: "session",
    github_username: decoded_token.github_username as string,
    account_id: decoded_token.account_id as string,
    session_id: decoded_token.session_id as string,
  }

  return next(req, ctx)
}
