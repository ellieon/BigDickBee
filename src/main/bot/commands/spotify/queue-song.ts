import * as DiscordClient from 'discord.js'
import { BaseCommand, Command } from 'bot/commands/command'
import { SpotifyHelper } from 'common/spotifyHelper'
import { SpotifyConnection } from 'common/database'

import * as logger from 'winston'

const NAME = 'bee!queue [user] <song_name>'
const DESCRIPTION = 'Searches for and adds it to a play queue'
const COMMAND_STRING: RegExp = /^bee!queue(?:\s<@!(?<userId>\d{17,19})>?)?(?:\s(?<songName>.+))?$/

@Command.register
export class QueueSong extends BaseCommand {
  private static readonly PLAYLIST_NAME = 'The Beelist'
  private static readonly PLAYLIST_DESC = `Errybody knows it's BIG DICK BEE!`

  private helper: SpotifyHelper = SpotifyHelper.getInstance()

  constructor () {
    super(NAME, COMMAND_STRING, DESCRIPTION)
  }

  async execute (message: DiscordClient.Message): Promise<void> {
    await this.findAndPlay(message)
  }

  async findAndPlay (message: DiscordClient.Message) {
    const matches = message.content.match(COMMAND_STRING)

    const songName = matches.groups.songName

    if (!matches || !songName || songName.length === 0) {
      message.channel.send('I need a song name to search `bee!queue [search_term]`').catch(logger.error)
      return
    }

    let users: SpotifyConnection[]
    if (matches.groups.userId) {
      users = [this.helper.getConnectionForUser(matches.groups.userId)]
    } else {
      users = this.helper.getAllConnections()
    }

    let name: string = undefined
    let artist: string
    let uri: string = undefined

    if (users.length === 0) {
      message.channel.send('There are currently no registered spotify users').catch(logger.error)
      return
    }

    for (let i = 0; i < users.length; i++) {
      const userId: string = users[i].userId

      if (!uri) {
        const trackData = await this.helper.searchForTrack(songName, userId)

        if (!trackData) {
          message.channel.send('I was unable to connect to spotify to search for tracks').catch(logger.error)
          await this.crossReactMessage(message)
          return
        }

        const tracks = trackData.body.tracks.items

        if (tracks.length === 0) {
          message.channel.send('I was unable to find any tracks by the name ' + songName).catch(logger.error)
          await this.crossReactMessage(message)
          return
        }

        name = tracks[0].name
        artist = tracks[0].artists[0].name
        uri = tracks[0].uri

      }

      await this.helper.queueSong(uri, userId).catch(logger.error)

      await this.addToPlaylist(userId, uri, message)
    }

    const successMessage = `Added the song \`${name} by ${artist}\` to`
    if (users.length === 1) {
      message.channel.send(`${successMessage} <@!${users[0].userId}>'s Beelist and queue`)
        .catch(logger.error)
    } else {
      message.channel.send(`${successMessage} The Beelist and queue for all users`)
        .catch(logger.error)
    }

    await this.checkReactMessage(message)

  }

  private async addToPlaylist (userId: string, uri: string, message: DiscordClient.Message) {
    let playlistId: string = await this.helper.getPlaylistForUser(userId,
      QueueSong.PLAYLIST_NAME)

    if (!playlistId) {
      playlistId = await this.helper.createPlaylistForUser(userId, QueueSong.PLAYLIST_NAME, QueueSong.PLAYLIST_DESC)
    }

    if (playlistId) {
      await this.helper.addSongToPlaylistForUser(userId, playlistId, uri)
    } else {
      message.channel.send(`Unable to create playlist for <@!${userId}>`)
        .catch((err) => logger.error(`unable to create playlist for ${userId}: ${err}`))
    }
  }
}
