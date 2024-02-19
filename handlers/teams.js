import TTLCache from '@isaacs/ttlcache'

const GLOBAL_NAMESPACE = process.env.GLOBAL_NAMESPACE

// Multi-level caching provided by API-level cache
// if this lambda expires, there's still a chance the API-level cache contains the data
const teamsCache = new TTLCache({
  max: parseInt(process.env.TTL_TEAMS_MAX),
  ttl: parseInt(process.env.TTL_TEAMS_MS)
})

export const teamsHandler = async (event) => {
  const teamID = event.pathParameters.id

  if (!teamID) {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: "Team ID required."
        }
      )
    }
  }

  let result = {}

  if (!teamsCache.has(`${GLOBAL_NAMESPACE}:teams:${teamID}`)) {
    result = await fetch(process.env.SELF_URL + "api/teams")
    const body = await result.json()

    result.metadata = { source: "API" }

    // Build cache based on all teams data
    body.forEach((team) => {
      if (parseInt(team.id) === parseInt(teamID)) console.log(`cacheKey: ${GLOBAL_NAMESPACE}:teams:${team.id}`)
      teamsCache.set(`${GLOBAL_NAMESPACE}:teams:${team.id}`, team)
    })
  }

  result = teamsCache.get(`${GLOBAL_NAMESPACE}:teams:${teamID}`)

  if (!result) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: `There is no team with the ID ${teamID}.`
      })
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // TODO: Put something real here
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(
      {
        metadata: {
          source: "TTLCache"
        },
        ...result
      }
    )
  }
}