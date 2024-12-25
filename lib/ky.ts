import defaultKy from "ky"

export const getBaseApiUrl = () => {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "https://dataset-api.autorouting.com"
  }
  return "http://localhost:3091"
}

export const ky = defaultKy.extend({
  prefixUrl: getBaseApiUrl(),
})
