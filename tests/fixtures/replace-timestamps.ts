export const replaceTimestamps = <T>(obj: T): T => {
  if (typeof obj !== "object" || obj === null) {
    // If it's a string, check if it looks like a timestamp
    if (typeof obj === "string") {
      // Match ISO date strings like "2024-12-20T03:55:31.019Z"
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      if (timestampRegex.test(obj)) {
        return "[timestamp]" as T
      }
    }
    return obj
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceTimestamps(item)) as T
  }

  // Handle objects
  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = replaceTimestamps(value)
  }
  return result
}
