import defaultKy from "ky"

export const getBaseApiUrl = () => "http://localhost:3091"

export const ky = defaultKy.extend({
  prefixUrl: getBaseApiUrl(),
})
