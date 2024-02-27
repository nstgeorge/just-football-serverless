export const authorizeByToken = (event, context, callback) => {
  const rawAuth = event.authorizationToken ?? event.headers?.Authorization

  if (!rawAuth) return callback({ isAuthorized: false })

  const [type, token] = rawAuth.split(" ")

  if (!type.toLowerCase() === 'bearer' && token !== process.env.SELF_API_KEY) {
    return callback({ isAuthorized: false })
  }

  // We have a valid API key
  return callback({ isAuthorized: true })
}