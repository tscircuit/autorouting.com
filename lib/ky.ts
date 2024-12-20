import defaultKy from "ky"

export const ky = defaultKy.extend({
  prefixUrl: "http://localhost:3091",
})
