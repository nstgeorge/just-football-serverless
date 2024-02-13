const transformResponseToObject = async (res) => ({
  statusCode: res.status,
  headers: {
    'Access-Control-Allow-Origin': '*', // TODO: Put something real here
    ...res.headers
  },
  body: JSON.stringify(!res.ok ? { message: await res.text() } : await res.json())
})

/**
 * Handle all HTTP requests. All paths are proxied here.
 */
module.exports.handler = async (event) => {
  if (event.rawPath.length > 1) {
    const path = event.rawPath.startsWith('/') ? event.rawPath.slice(1) : event.rawPath
    try {
      const response = await fetch(`${process.env.CFB_API_BASE_URL}${path}?${event.rawQueryString}`, {
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
