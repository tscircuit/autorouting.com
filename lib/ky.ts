import defaultKy from "ky"

export const getBaseApiUrl = () =>
  process.env.VERCEL
    ? "https://dataset-api.autorouting.com"
    : "http://localhost:3091"

export const ky = defaultKy.extend({
  prefixUrl: getBaseApiUrl(),
})
