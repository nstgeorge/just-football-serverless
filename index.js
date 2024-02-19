import transformResponseToObject from "./utils/transformResponseToObject.js"

/**
 * Handle all HTTP requests. All paths are proxied here.
 */
export const handler = async (event) => {
  let path = event.rawPath ?? event.path
  if (path && path.length > 1) {
    path = path.startsWith('/') ? path.slice(5) : path.slice(4)
    try {
      const response = await fetch(`${process.env.CFB_API_BASE_URL}${path}?${event.rawQueryString ?? ''}`, {
        headers: {
          Authorization: `Bearer ${process.env.CFB_API_TOKEN}`
        }
      })
      return await transformResponseToObject(response)
    } catch (e) {
      console.log('An error occurred:', e.message)
      return { statusCode: 500, body: JSON.stringify({ err: 'An unexpected error occurred while proxying the request.' }) }
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: "Path required."
        }
      )
    }
  }
}
