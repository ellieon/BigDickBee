import * as express from 'express'
import { EnvironmentHelper } from 'common/environmentHelper'
import { JwtHelper } from 'web/common/jwtHelper'
import { SpotifyConnection } from 'common/database'
import { DiscordHelper } from 'common/discordHelper'
import { User } from 'discord.js'
import { SpotifyHelper } from 'common/spotifyHelper'
// tslint:disable-next-line:no-default-export
export default express.Router()
  .get('/index', indexRoute)
  .get('/', indexRoute)

async function indexRoute (req, res, next) {
  const token = JwtHelper.readBearerTokenFromRequest(req)
  let spotifyConnection: SpotifyConnection = undefined
  let user: User = undefined
  let username: string = undefined
  if (token) {
    const userId: string = await DiscordHelper.getUserId(token)
    user = await DiscordHelper.getUser(token)
    username = user.username
    spotifyConnection = SpotifyHelper.getInstance().getConnectionForUser(userId)

  }

  res.render('index.njk', {
    baseUrl: EnvironmentHelper.getBaseURL(),
    discordConnected: token !== undefined,
    spotifyConnected: spotifyConnection !== undefined,
    username: username
  })
}
