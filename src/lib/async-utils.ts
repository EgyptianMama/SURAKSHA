// Safe async timeout helper to prevent UI hangs when network or Firestore is blocked/offline

export async function withTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  ms: number = 2000
): Promise<T> {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback)
    }, ms)
  })

  return Promise.race([
    promise
      .then((res) => {
        clearTimeout(timer)
        return res
      })
      .catch((err) => {
        clearTimeout(timer)
        console.warn("Async operation failed, using fallback:", err)
        return fallback
      }),
    timeoutPromise
  ])
}
