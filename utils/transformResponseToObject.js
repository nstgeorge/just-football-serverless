const transformResponseToObject = async (res, overrideBody) => ({
  statusCode: res.status,
  headers: {
    'Access-Control-Allow-Origin': '*', // TODO: Put something real here
    'Access-Control-Allow-Credentials': true,
    ...res.headers
  },
  body: JSON.stringify(overrideBody ?? await res.json())
})

export default transformResponseToObject